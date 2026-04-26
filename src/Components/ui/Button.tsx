import { motion } from "framer-motion";

const Button = ({ children, className, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors
        hover:bg-blue-700 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
