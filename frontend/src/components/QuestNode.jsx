import { motion } from "framer-motion";

function QuestNode({ stop, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      className="flex flex-col items-center cursor-pointer"
      onClick={() => onClick(stop)}
    >
      <div className="w-20 h-20 rounded-full bg-cyan-500 hover:bg-cyan-400 shadow-lg flex items-center justify-center text-3xl">
        {stop.icon}
      </div>

      <p className="mt-3 font-semibold text-center">
        {stop.name}
      </p>
    </motion.div>
  );
}

export default QuestNode;