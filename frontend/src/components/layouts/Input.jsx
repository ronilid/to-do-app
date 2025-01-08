const Input = ({ id, type, placeholder, value, onChange, required }) => {
  return (
    <div style={{ padding: "10px" }}>
      <input id={id} style={{ width: "20vw" }} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required || false} />
    </div>
  );
};

export default Input;
