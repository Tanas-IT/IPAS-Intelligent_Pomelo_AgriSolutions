import { logo } from "@/assets/images/images";
import style from "./Header.module.scss";
import NavItem from "@/constants/navItem";
import { ButtonAuth } from "@/components/UI/ButtonAuth/ButtonAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolling(true);
        console.log("scrolling");
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavigateAndScroll = (hash: string) => {
    if (window.location.pathname !== "/") {
      navigate("/");
    }

    setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  };
  return (
    <header className={`${style.header} ${scrolling ? style.scrolled : ""}`}>
      <a href="/">
        <img className={style.img} src={logo} alt="IPAS Logo" />
      </a>

      <nav className={style.nav}>
        {NavItem.map((item, index) => (
          <a key={index} onClick={() => handleNavigateAndScroll(item.href)}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className={style.authButtons}>
        <ButtonAuth label="Sign In" href="/auth?mode=sign-in" className="button_auth_signin" />
        <ButtonAuth label="Sign Up" href="/auth?mode=sign-up" className="button_auth_signup" />
      </div>
    </header>
  );
};

export default Header;
