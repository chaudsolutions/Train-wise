import Maps from "../../Custom/Maps/Maps";
import { FaLocationArrow } from "react-icons/fa";
import { MdWifiCalling3 } from "react-icons/md";
import { TbMessages } from "react-icons/tb";
import { companyName } from "../../Hooks/useVariable";
import "./others.css";

const ContactUs = () => {
    return (
        <div className="home">
            <header>
                <h1>Contact Us</h1>
                <p>You can contact us with the information provided below</p>
            </header>

            <div className="contactInfo">
                <Maps />

                <ul>
                    <li>
                        <FaLocationArrow size={35} />
                        <div>Location...</div>
                    </li>
                    <li>
                        <MdWifiCalling3 size={35} />
                        <div>+1234567890, +1234567890</div>
                    </li>
                    <li>
                        <TbMessages size={35} />
                        <div>
                            Care@{companyName}.com, Contact@{companyName}.com
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ContactUs;
