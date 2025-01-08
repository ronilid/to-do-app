const DropDown = ({ title, id, className, value, onChange, options, htmlFor }) => {
  return (
    <div style={{ flex: 1 }}>
      <label htmlFor="priority-select" style={{ display: "block", marginBottom: "5px" }}>
        {title}
      </label>
      <select id={id} className={className} value={value} onChange={onChange}>
        {options.map((option, index) => (
          <option value={index + 1}>{option}</option>
        ))}
      </select>
    </div>
  );
};

export default DropDown;
