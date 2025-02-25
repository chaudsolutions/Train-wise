import CountUp from "react-countup";
import { FaPlus } from "react-icons/fa";
import "./count.css";

export const CountUpComponent = () => {
  return (
    <div className="countUp">
      <div>
        <div className="countUpDiv">
          <CountUp end={3000} duration={2} delay={0.5} />
          <FaPlus size={20} />
        </div>
        <p>Students</p>
      </div>
      <div>
        <div className="countUpDiv">
          <CountUp end={100} duration={2} delay={0.5} />
          <FaPlus size={20} />
        </div>

        <p>Teachers</p>
      </div>
      <div>
        <div className="countUpDiv">
          <CountUp end={5000} duration={2} delay={0.5} />
          <FaPlus size={20} />
        </div>

        <p>Parents</p>
      </div>
      <div>
        <div className="countUpDiv">
          <CountUp end={200} duration={2} delay={0.5} />
          <FaPlus size={20} />
        </div>

        <p>Classrooms</p>
      </div>
    </div>
  );
};
