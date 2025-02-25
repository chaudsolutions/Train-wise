const BuggyComponent = () => {
  throw new Error("I crashed!");
  return <div>This will not render.</div>;
};

export default BuggyComponent;
