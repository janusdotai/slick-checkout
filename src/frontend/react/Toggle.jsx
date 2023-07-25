import React from "react";

export function ToggleCheckbox({ label, toggled, onClick }) {
  //const [isToggled, toggle] = useState(toggled);
  //console.log("compoentn is isToggled " + toggled)

  const callback = (e) => {    
    var checked = e.target.checked;    
    onClick(checked);
  };

  return (
    <label className="toggle_label">
      <input type="checkbox" checked={toggled} onChange={callback} className="toggle_input" />
      <span className="toggle_span"></span>
      <strong className="toggle_strong">{label}</strong>
    </label>
  );
}
