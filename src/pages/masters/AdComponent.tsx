import React, { useState, useEffect } from "react";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import AlertBox from "@/components/ui/AlertBox";
import { Spinner } from "../profiles/Resources";

interface UserData {
  id: string;
  displayName: string;
  userPrincipalName: string;
  mail: string;
  mobilePhone: string | null;
  businessPhones: string | null;
  givenName: string | null;
  officeLocation: string | null;
  preferredLanguage: string | null;
  jobTitle: string | null;
  surname: string | null;
}

interface DropdownOption {
  label: string;
  value: string;
}

interface AdComponentProps {
  closeModal: () => void;
  fetchUser: () => void;
}

const AdComponent: React.FC<AdComponentProps> = ({ closeModal, fetchUser }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);
  const [data, setData] = useState<UserData[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [apiMessage, setApiMessage] = useState("Message");

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
    closeModal();
    fetchUser();
  };

  const fetchDropdownOptions = async () => {
    try {
      const token = localStorage.getItem("Token");
      const res = await fetch(
        `${BASE_URL}/integration/get_activedirectory_customer_integration?customer_id=123`, // replace getCustomerId()
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      const result = await res.json();
      if (result.status === "success" && Array.isArray(result.data)) {
        setDropdownOptions(
          result.data.map((item: any) => ({
            label: item.description,
            value: item.integration_customer_id.toString(),
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching dropdown:", err);
    }
  };

  const fetchData = async (optionValue: string) => {
    try {
      const token = localStorage.getItem("Token");
      const res = await fetch(
        `${BASE_URL}/integration/get_users?integration_customer_id=${optionValue}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      const result = await res.json();
      if (result.status === "success" && result.data?.users) {
        setData(result.data.users);
        setDataLoading(false);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setDataLoading(false);
      showAlert("Failed to fetch AD");
    }
  };

  const handleImport = async () => {
    try {
      const selectedData = data.filter((d) => selectedRows.includes(d.id));
      const formatted = selectedData.map((item) => ({
        businessPhones: item.businessPhones,
        displayName: item.displayName,
        givenName: item.givenName,
        jobTitle: item.jobTitle,
        mail: item.mail,
        mobilePhone: item.mobilePhone,
        officeLocation: item.officeLocation,
        preferredLanguage: item.preferredLanguage,
        surname: item.surname,
        userPrincipalName: item.userPrincipalName,
        id: item.id,
      }));

      const token = localStorage.getItem("Token");
      const res = await fetch(`${BASE_URL}/integration/addUpdate_ADUsers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ users: formatted, integration_id: selectedOption }),
      });

      const parsed = await res.json();
      if (parsed.status === "success") {
        showAlert(parsed.message);
      } else {
        showAlert(parsed.message || "Unknown error");
      }
    } catch (err: any) {
      console.error("Error importing:", err);
      showAlert(err.message || "Failed to import");
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((d) => d.id));
    }
    setSelectAll(!selectAll);
  };

  const filteredData = data.filter(
    (item) =>
      item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  useEffect(() => {
    if (selectedOption) {
        setDataLoading(true);
      fetchData(selectedOption);
    }
  }, [selectedOption]);

  return (
    <>
      <AlertBox visible={alertVisible} onCloseAlert={closeAlert} message={alertMessage} />

      <div className="p-6 bg-white">
        <h2 className="text-xl font-bold text-[#044086] text-center mb-4">
          Sync Active Directory (AD)
        </h2>

        {/* Dropdown */}
        <div className="flex justify-center mb-4">
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="w-60 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
          >
            <option value="">Select</option>
            {dropdownOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
{dataLoading && (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}
        {/* Search */}
        {data.length > 0 && (
          <div className="flex justify-end mb-4">
            <input
              type="text"
              placeholder="Search by Name/Mail"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
          </div>
        )}

        {/* Table */}
        {data.length > 0 && (
          <div className="overflow-auto border rounded-lg">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-2 text-left">
                    <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
                  </th>
                  <th className="p-2 text-center">S.No</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Job Title</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left" >Mobile Phone</th>
                </tr>
              </thead>
              <tbody>
                {(searchQuery ? filteredData : data).map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => toggleRowSelection(item.id)}
                      />
                    </td>
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2">{item.displayName}</td>
                    <td className="p-2">{item.jobTitle || "-"}</td>
                    <td className="p-2">{item.mail}</td>
                    <td className="p-2">{item.mobilePhone || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Import Button */}
        {data.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Import Selected ({selectedRows.length} user(s))
            </button>
          </div>
        )}
      </div>

      {/* API Message Modal */}
      {messageModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-bold text-center mb-4">{apiMessage}</h3>
            <div className="flex justify-center">
              <button
                onClick={() => setMessageModalVisible(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdComponent;
