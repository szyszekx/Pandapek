import "./SteamButton.css";
import SteamIcon from '../icon/SteamIcon';

type SteamButtonProps = {
  loginUrl?: string;
};

export default function SteamButton({
    loginUrl = "http://localhost:5000/login/steam",
}: SteamButtonProps) {
    return (
    <a href={loginUrl} className="steambutton">
        <span>Login With Steam</span>

        <div className="icon">
            <SteamIcon className="fa fa-steam-square"/>
        </div>
    </a>
    );
}