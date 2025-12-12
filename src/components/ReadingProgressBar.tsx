import { useEffect, useState } from "react";

const ReadingProgressBar = () => {
  const [width, setWidth] = useState(0);

  const scrollHeight = () => {
    const element = document.documentElement;
    const ScrollTop = element.scrollTop || document.body.scrollTop;
    const ScrollHeight = element.scrollHeight || document.body.scrollHeight;
    const clientHeight = element.clientHeight || document.body.clientHeight; // Height of window 

    // Calculate height of the scrolling area
    const height = ScrollHeight - clientHeight;
    // Calculate percentage
    const scrolled = (ScrollTop / height) * 100;
    
    setWidth(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", scrollHeight);
    return () => window.removeEventListener("scroll", scrollHeight);
  }, []);

  return (
    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 fixed top-0 left-0 z-50">
      <div
        className="h-full bg-blue-600 transition-all duration-100 ease-out"
        style={{ width: `${width}%` }}
      ></div>
    </div>
  );
};

export default ReadingProgressBar;