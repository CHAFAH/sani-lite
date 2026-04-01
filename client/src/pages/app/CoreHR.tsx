import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Upload, FileText, Download } from "lucide-react";

export default function CoreHR() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    documentType: "employment_contract",
    fileName: "",
    fileUrl: "",
  });

  const listEmployeesMutation = trpc.employee.list.useQuery();
  const uploadDocumentMutation = trpc.employee.uploadDocument.useMutation();
  const getDocumentsMutation = trpc.employee.getDocuments.useQuery(selectedEmployee?.id || 0, { enabled: !!selectedEmployee });

  const handleUploadDocument = async () => {
    if (!selectedEmployee || !uploadData.fileName || !uploadData.fileUrl) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await uploadDocumentMutation.mutateAsync({
        employeeId: selectedEmployee.id,
        documentType: uploadData.documentType as any,
        fileName: uploadData.fileName,
        fileUrl: uploadData.fileUrl,
      });
      setUploadData({
        documentType: "employment_contract",
        fileName: "",
        fileUrl: "",
      });
      setIsUploadOpen(false);
      toast.success("Document uploaded successfully");
      getDocumentsMutation.refetch();
    } catch (error) {
      toast.error("Failed to upload document");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Core HR</h1>
        <p className="text-gray-600 mt-1">Manage employee records, documents, and profiles</p>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>View and manage all employee records</CardDescription>
            </CardHeader>
            <CardContent>
              {listEmployeesMutation.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : listEmployeesMutation.data && listEmployeesMutation.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listEmployeesMutation.data.map((employee: any) => (
                    <Card
                      key={employee.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{employee.firstName} {employee.lastName}</h3>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                          <div className="pt-2 space-y-1 text-sm">
                            <p><span className="text-gray-600">Department:</span> {employee.department || "-"}</p>
                            <p><span className="text-gray-600">Position:</span> {employee.position || "-"}</p>
                            <p>
                              <span className="text-gray-600">Status:</span>{" "}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                employee.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}>
                                {employee.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No employees found. Add employees from the Admin Dashboard.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Employee Documents</CardTitle>
                <CardDescription>Manage employment contracts, offers, and other documents</CardDescription>
              </div>
              {selectedEmployee && (
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                      <DialogDescription>Upload a document for {selectedEmployee.firstName} {selectedEmployee.lastName}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Document Type</label>
                        <Select value={uploadData.documentType} onValueChange={(value) => setUploadData({ ...uploadData, documentType: value })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employment_contract">Employment Contract</SelectItem>
                            <SelectItem value="offer_letter">Offer Letter</SelectItem>
                            <SelectItem value="nda">NDA</SelectItem>
                            <SelectItem value="handbook">Handbook</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">File Name</label>
                        <Input
                          placeholder="employment_contract_2026.pdf"
                          value={uploadData.fileName}
                          onChange={(e) => setUploadData({ ...uploadData, fileName: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">File URL</label>
                        <Input
                          placeholder="https://cdn.example.com/document.pdf"
                          value={uploadData.fileUrl}
                          onChange={(e) => setUploadData({ ...uploadData, fileUrl: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <Button onClick={handleUploadDocument} className="w-full bg-teal-600 hover:bg-teal-700" disabled={uploadDocumentMutation.isPending}>
                        {uploadDocumentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Upload
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {!selectedEmployee ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Select an employee from the Employees tab to view and upload documents</p>
                </div>
              ) : getDocumentsMutation.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : getDocumentsMutation.data && getDocumentsMutation.data.length > 0 ? (
                <div className="space-y-2">
                  {getDocumentsMutation.data.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">{doc.documentType}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(doc.fileUrl, "_blank")}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No documents uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Profiles</CardTitle>
              <CardDescription>View detailed employee information</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedEmployee ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Select an employee from the Employees tab to view their profile</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">First Name</label>
                      <p className="font-medium">{selectedEmployee.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Last Name</label>
                      <p className="font-medium">{selectedEmployee.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Department</label>
                      <p className="font-medium">{selectedEmployee.department || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Position</label>
                      <p className="font-medium">{selectedEmployee.position || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Employment Type</label>
                      <p className="font-medium capitalize">{selectedEmployee.employmentType?.replace("_", " ") || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <p className={`font-medium px-2 py-1 rounded-full text-xs w-fit ${
                        selectedEmployee.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {selectedEmployee.status}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Joined</label>
                      <p className="font-medium">{new Date(selectedEmployee.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
