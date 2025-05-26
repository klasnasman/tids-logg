import React from 'react';

const SidebarOpen: React.FC<React.SVGProps<SVGSVGElement>> = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="hover:bg-hover"
      width="28"
      height="28"
      fill="currentColor"
      viewBox="0 -960 960 960"
      {...props}>
      <path d="M463.85-353.08v-253.84L336.15-480zM640-200h120v-560H640zm-440 0h400v-560H200zm440 0h120zm-480 40v-640h640v640z"></path>
    </svg>
  );
};

export default SidebarOpen;
