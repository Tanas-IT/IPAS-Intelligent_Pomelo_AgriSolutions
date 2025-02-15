import style from "./ButtonAuth.module.scss";

interface ButtonAuthProps {
  label: string;
  href: string;
  className: string;
}

export const ButtonAuth: React.FC<ButtonAuthProps> = ({ label, href, className }) => {
  return (
    <a href={href} className={`${style.button_auth} ${style[className]}`}>
      {label}
    </a>
  );
};
