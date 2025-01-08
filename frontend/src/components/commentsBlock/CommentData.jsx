const CommentData = ({ title, description, due_date, status_id, status, priority }) => {
  return (
    <div style={{ display: "block", textDecoration: status_id === 4 ? "line-through" : "none" }}>
      <div>
        <strong>{title}</strong>
      </div>
      <div>
        <p>{description || "No description provided."}</p>
      </div>
      <div>
        <p>Due Date: {due_date ? new Date(due_date).toLocaleDateString() : "No due date set."}</p>
        <p>Status: {status}</p>
        <p>Priority: {priority}</p>{" "}
      </div>
    </div>
  );
};

export default CommentData;
