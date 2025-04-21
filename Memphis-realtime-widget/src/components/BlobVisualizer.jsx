import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * BlobVisualizer renders a dynamic visualization with central circle and orbiting particles
 * that responds to volume and active state.
 *
 * Props:
 * - isActive: boolean flag to start/stop animation
 * - volume: number between 0 and 1 for level visualization
 * - onClick: function to handle toggle
 * - size: optional size in pixels (default 100)
 */
export default function BlobVisualizer({ isActive, volume, onClick, size = 100 }) {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const particlesRef = useRef([]);
  const centerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    // Canvas setup
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    const width = size * 2; // Double the size for better particles visibility
    const height = size * 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    
    // Center point
    centerRef.current = { x: width / 2, y: height / 2 };
    
    // Create particles
    const createParticles = () => {
      const particles = [];
      const count = 40 + Math.floor(size / 5); // Scale particle count with size
      
      for (let i = 0; i < count; i++) {
        // Random angle and distance from center
        const angle = Math.random() * Math.PI * 2;
        const distance = (size * 0.4) + Math.random() * (size * 0.6);
        
        // Calculate position
        const x = centerRef.current.x + Math.cos(angle) * distance;
        const y = centerRef.current.y + Math.sin(angle) * distance;
        
        particles.push({
          x,
          y,
          size: 1 + Math.random() * (size / 20), // Scale particle size with canvas size
          speed: 0.2 + Math.random() * 0.8,
          angle,
          distance,
          orbit: (size * 0.35) + Math.random() * (size * 0.65),
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.04,
          alpha: 0.3 + Math.random() * 0.7,
        });
      }
      
      return particles;
    };
    
    particlesRef.current = createParticles();
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [size]);
  
  // Animation loop
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = centerRef.current.x;
    const centerY = centerRef.current.y;
    const centerRadius = size * 0.35; // Center circle size relative to canvas
    
    const animate = () => {
      frameRef.current += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw glow effect
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, centerRadius * 3
      );
      
      if (isActive) {
        // Green glow for active state
        glowGradient.addColorStop(0, 'rgba(52, 211, 153, 0.2)');
        glowGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.1)');
        glowGradient.addColorStop(1, 'rgba(5, 150, 105, 0)');
      } else {
        // Purple glow for inactive state
        glowGradient.addColorStop(0, 'rgba(124, 58, 237, 0.2)');
        glowGradient.addColorStop(0.5, 'rgba(109, 40, 217, 0.1)');
        glowGradient.addColorStop(1, 'rgba(91, 33, 182, 0)');
      }
      
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      
      const circleGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, centerRadius
      );
      
      // Main circle gradient - changes based on active state
      if (isActive) {
        // Green gradient when active
        circleGradient.addColorStop(0, 'rgba(5, 150, 105, 0.8)'); // Dark green core
        circleGradient.addColorStop(1, 'rgba(16, 185, 129, 0.7)'); // Light green edge
      } else {
        // Purple/blue gradient when inactive
        circleGradient.addColorStop(0, 'rgba(91, 33, 182, 0.8)'); // Purple core
        circleGradient.addColorStop(1, 'rgba(67, 56, 202, 0.7)'); // Blue edge
      }
      
      ctx.fillStyle = circleGradient;
      ctx.fill();
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        // Update position with wobble
        particle.wobble += particle.wobbleSpeed;
        const wobbleAmount = Math.sin(particle.wobble) * (size * 0.1);
        
        // Calculate orbit position
        const orbit = particle.orbit + wobbleAmount;
        
        // Rotate around center
        particle.angle += particle.speed * 0.005 * (isActive ? (1 + volume * 0.5) : 1);
        
        // Calculate new position
        particle.x = centerX + Math.cos(particle.angle) * orbit;
        particle.y = centerY + Math.sin(particle.angle) * orbit;
        
        // Draw particle
        ctx.beginPath();
        
        // Size variation based on volume when active
        const sizeMultiplier = isActive ? (0.8 + volume * 0.4) : 1;
        const particleSize = particle.size * sizeMultiplier;
        
        ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
        
        if (isActive) {
          // Green particles when active
          ctx.fillStyle = `rgba(52, 211, 153, ${particle.alpha})`;
        } else {
          // Purple/blue particles when inactive
          ctx.fillStyle = `rgba(124, 58, 237, ${particle.alpha})`;
        }
        
        ctx.fill();
      });
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, volume, size]);
  
  return (
    <canvas 
      ref={canvasRef} 
      onClick={onClick} 
      style={{ 
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'block',
        width: `${size * 2}px`,
        height: `${size * 2}px`
      }} 
    />
  );
}

BlobVisualizer.propTypes = {
  isActive: PropTypes.bool.isRequired,
  volume: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  size: PropTypes.number,
};