import { useEffect, useMemo, useState } from "react";
import { Check, X, Clock, MessageCircle, Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { socket } from "../../socket";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";

type UserRef = {
  _id: string;
  name: string;
  email?: string;
};

type ApiRequest = {
  _id: string;
  fromUserId: UserRef;
  toUserId: UserRef;
  message: string;
  hackathon?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export function Requests() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<ApiRequest[]>([]);

  const fetchRequests = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/api/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(res.data || []);
    } catch (error) {
      console.error("Failed to fetch requests", error);
      if (!(error as any)?.response) {
        toast.error(`Backend is not running at ${API_BASE_URL}`);
      }
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", user._id);

    const handleRequestUpdate = () => {
      fetchRequests();
    };

    socket.on("requestUpdated", handleRequestUpdate);

    return () => {
      socket.off("requestUpdated", handleRequestUpdate);
    };
  }, [user?._id, token]);

  const handleStatusUpdate = async (
    requestId: string,
    status: "accepted" | "declined"
  ) => {
    if (!token) return;

    try {
      await axios.patch(
        `${API_BASE_URL}/api/requests/${requestId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status } : req
        )
      );

      toast.success(
        status === "accepted" ? "Request accepted" : "Request declined"
      );
    } catch (error) {
      console.error("Failed to update request status", error);
      toast.error("Could not update request status");
    }
  };

  const pendingRequests = useMemo(
    () => requests.filter((req) => req.status === "pending"),
    [requests]
  );
  const acceptedRequests = useMemo(
    () => requests.filter((req) => req.status === "accepted"),
    [requests]
  );
  const declinedRequests = useMemo(
    () => requests.filter((req) => req.status === "declined"),
    [requests]
  );

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString();
  };

  const RequestCard = ({ request }: { request: ApiRequest }) => {
    const currentUserId = user?._id;
    const isIncoming = request.toUserId?._id === currentUserId;

    const otherUser = isIncoming ? request.fromUserId : request.toUserId;

    return (
      <Card className="p-6 bg-white border-[#E2E8F0] hover:shadow-lg transition-all">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="w-14 h-14 ring-2 ring-[#C1E8FF]">
              <AvatarImage
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
                alt={otherUser?.name || "User"}
              />
              <AvatarFallback className="bg-[#5483B3] text-white">
                {(otherUser?.name || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-[#052659] mb-1">
                    {otherUser?.name || "Unknown user"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                    <span className="flex items-center gap-1">
                      {isIncoming ? (
                        <ArrowDownLeft className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                      {isIncoming ? "Incoming" : "Sent"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(request.createdAt)}
                    </span>
                    {request.hackathon && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {request.hackathon}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Badge
                  className={
                    request.status === "pending"
                      ? "bg-[#C1E8FF]/30 text-[#5483B3]"
                      : request.status === "accepted"
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : "bg-[#64748B]/10 text-[#64748B]"
                  }
                >
                  {request.status}
                </Badge>
              </div>

              <p className="text-[#475569] text-sm">{request.message}</p>
            </div>
          </div>

          {request.status === "pending" && isIncoming && (
            <div className="flex md:flex-col gap-2 md:w-28">
              <Button
                onClick={() => handleStatusUpdate(request._id, "accepted")}
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white"
              >
                <Check className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Accept</span>
              </Button>
              <Button
                onClick={() => handleStatusUpdate(request._id, "declined")}
                variant="outline"
                className="flex-1 border-[#E2E8F0] text-[#64748B] hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <X className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Decline</span>
              </Button>
            </div>
          )}

          {request.status === "pending" && !isIncoming && (
            <div className="md:w-28 flex items-center text-sm text-[#64748B]">
              Awaiting response
            </div>
          )}

          {request.status === "accepted" && (
            <div className="md:w-28">
              <Link to={`/messages/${otherUser?._id}`} className="w-full block">
                <Button className="w-full bg-[#5483B3] hover:bg-[#052659] text-white">
                  <MessageCircle className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Message</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#052659] mb-2">Team Requests</h1>
        <p className="text-[#64748B]">Manage sent and received collaboration requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-[#C1E8FF]/30 to-white border-[#C1E8FF]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Pending</p>
              <p className="text-2xl font-bold text-[#052659]">{pendingRequests.length}</p>
            </div>
            <div className="p-3 bg-[#5483B3]/10 rounded-full">
              <Clock className="w-6 h-6 text-[#5483B3]" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#10B981]/10 to-white border-[#10B981]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Accepted</p>
              <p className="text-2xl font-bold text-[#052659]">{acceptedRequests.length}</p>
            </div>
            <div className="p-3 bg-[#10B981]/10 rounded-full">
              <Check className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#64748B]/10 to-white border-[#64748B]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Declined</p>
              <p className="text-2xl font-bold text-[#052659]">{declinedRequests.length}</p>
            </div>
            <div className="p-3 bg-[#64748B]/10 rounded-full">
              <X className="w-6 h-6 text-[#64748B]" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-white border border-[#E2E8F0]">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-[#5483B3] data-[state=active]:text-white"
          >
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger
            value="accepted"
            className="data-[state=active]:bg-[#5483B3] data-[state=active]:text-white"
          >
            Accepted ({acceptedRequests.length})
          </TabsTrigger>
          <TabsTrigger
            value="declined"
            className="data-[state=active]:bg-[#5483B3] data-[state=active]:text-white"
          >
            Declined ({declinedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center bg-white border-[#E2E8F0]">
              <Clock className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#052659] mb-2">No Pending Requests</h3>
              <p className="text-[#64748B]">No active request at the moment.</p>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {acceptedRequests.length === 0 ? (
            <Card className="p-8 text-center bg-white border-[#E2E8F0]">
              <Check className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#052659] mb-2">No Accepted Requests</h3>
              <p className="text-[#64748B]">Accepted requests will appear here.</p>
            </Card>
          ) : (
            acceptedRequests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="declined" className="space-y-4">
          {declinedRequests.length === 0 ? (
            <Card className="p-8 text-center bg-white border-[#E2E8F0]">
              <X className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#052659] mb-2">No Declined Requests</h3>
              <p className="text-[#64748B]">Declined requests will appear here.</p>
            </Card>
          ) : (
            declinedRequests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
