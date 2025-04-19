# Ticket 9: UI Polish

**Objective**
Refine the widget’s look and feel.

**Steps**
1. Install React Icons:
   ```bash
   npm install react-icons
   ```
2. Replace text button with icons:
   ```jsx
   import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'
   ```
3. Comment out or remove any raw JSON/event log UI.
4. Style the widget (floating mic in corner) via CSS or Tailwind.
5. Ensure `<audio>` starts muted and only unmutes on a user gesture.

**Acceptance Criteria**
- Icon toggles between mic/mic‐slash.
- No raw JSON log visible.
- Widget floats with a clean, compact UI.
