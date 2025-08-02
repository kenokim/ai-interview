import { BrainCircuit } from 'lucide-react';

const FancyAvatar = ({ isThinking }: { isThinking: boolean }) => {
  return (
    <div className={`relative w-64 h-64 mx-auto rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-105`}>
      {/* 바깥쪽 그라데이션 링 */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full ${isThinking ? "animate-pulse-scale" : ""}`}></div>
      
      {/* 중간 그라데이션 링 */}
      <div className="absolute inset-1 bg-gradient-to-br from-blue-300 to-indigo-500 rounded-full"></div>

      {/* 안쪽 배경 */}
      <div className="relative w-[15.25rem] h-[15.25rem] bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
        {/* 미세하게 움직이는 내부 원들 */}
        <div className={`absolute w-48 h-48 bg-blue-500/20 rounded-full blur-2xl animate-pulse-slow`}></div>
        <div className={`absolute w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse-medium`}></div>
        
        <BrainCircuit className="h-24 w-24 text-white/80 z-10" />
      </div>
    </div>
  );
};

export default FancyAvatar;
