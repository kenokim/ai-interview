import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getSessionStatus } from "@/services/api";

const ReportPage = () => {
  const location = useLocation();
  const { sessionId } = location.state || {};
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!sessionId) {
        setError("세션 ID를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getSessionStatus(sessionId);
        if (response.success) {
          setReport(response.data);
        } else {
          setError(response.error || "리포트를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("서버와 통신 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [sessionId]);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-gray-600 mb-8">리포트를 불러오는 중입니다...</p>;
    }

    if (error) {
      return <p className="text-red-500 mb-8">{error}</p>;
    }

    if (report) {
      // This is a basic rendering. You can expand this based on the actual report data structure.
      return (
        <div className="text-left">
          <h2 className="text-2xl font-semibold mb-4">면접 요약</h2>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      );
    }

    return <p className="text-gray-600 mb-8">리포트 내용이 없습니다.</p>;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8 m-4">
        <h1 className="text-3xl font-bold text-center mb-8">면접 결과 리포트</h1>
        <div className="text-center">
          {renderContent()}
          <Button asChild className="mt-8">
            <Link to="/">메인으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportPage; 