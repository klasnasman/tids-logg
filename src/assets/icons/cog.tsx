import React from 'react';

const Cog: React.FC<React.SVGProps<SVGSVGElement>> = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="hover:bg-hover"
      width="28"
      height="28"
      fill="currentColor"
      viewBox="0 -960 960 960"
      {...props}>
      <path d="M460-140v-200h40v80h320v40H500v80zm-320-80v-40h200v40zm160-160v-80H140v-40h160v-80h40v200zm160-80v-40h360v40zm160-160v-200h40v80h160v40H660v80zm-480-80v-40h360v40z"></path>
    </svg>
  );
};

export default Cog;
