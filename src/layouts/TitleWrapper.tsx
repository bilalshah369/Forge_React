import { useEffect } from "react";
import { useTitle } from "./PageTitleContext";

interface Props {
  title: string;
  children: React.ReactNode;
}

const TitleWrapper = ({ title, children }: Props) => {
  const { setTitle } = useTitle();

  useEffect(() => {
    document.title = title;
    setTitle(title);
  }, [title]);

  return <>{children}</>;
};

export default TitleWrapper;
