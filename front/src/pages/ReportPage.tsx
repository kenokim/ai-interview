import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ReportPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8 m-4">
        <h1 className="text-3xl font-bold text-center mb-8">면접 결과 리포트</h1>
        <div className="text-center">
          <p className="text-gray-600 mb-8">리포트 내용이 여기에 표시됩니다.</p>
          <Button asChild>
            <Link to="/">메인으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportPage; 