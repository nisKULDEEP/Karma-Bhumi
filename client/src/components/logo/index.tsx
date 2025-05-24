import { AudioWaveform } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  url?: string;
  renderLink?: boolean;
}

const Logo = (props: LogoProps) => {
  const { url = "/", renderLink = true } = props;
  
  const logoContent = (
    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <AudioWaveform className="size-4" />
    </div>
  );
  
  if (renderLink) {
    return (
      <div className="flex items-center justify-center sm:justify-start">
        <Link to={url}>
          {logoContent}
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center sm:justify-start">
      {logoContent}
    </div>
  );
};

export default Logo;
