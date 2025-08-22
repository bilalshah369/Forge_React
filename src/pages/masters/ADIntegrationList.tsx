/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  GetClosedProjects,
  GetClosedProjectsWithFilters,
  GetMasterDataPM,
} from "@/utils/PM";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DeleteSVG, EditSVG, ProjectPhaseSVG } from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { StartProject } from "@/utils/ApprovedProjects";
import { AddADForCustomer, DeleteAD, GetADIntegrationsForCustomer, GetADList } from "@/utils/Integration";
import { useTheme } from "@/themes/ThemeProvider";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
const options = {
  execute: false,
  cancel: false,
  onHold: false,
  completeAndClose: false,
  movetoapprove: true,
};
const ADIntegrationList = () => {
      const [alertVisible, setAlertVisible] = useState(false);
      const [message, setMessage] = useState("");
     const [adList, setAdList] = useState([]);
       const [isModalVisible, setIsModalVisible] = useState(false);
      const [customerId, setCustomerId] = useState('1');
      const [ad, setAd] = useState([]);
      const [headers, setHeaders] = useState<Header[]>([
    {
        label: '#', key: 'sno', visible: true, type: 'sno', column_width: '50',
        url: "",
        order_no: 0
    },

    {
      label: 'Provider',
      key: 'integration_name',
      visible: true,
      type: '',
      column_width: '200',
         url: "",
        order_no: 0
    },
    {
      label: 'Description',
      key: 'description',
      visible: true,
      type: '',
      column_width: '200',
         url: "",
        order_no: 0
    },

    {
      label: 'Action',
      key: 'action',
      visible: true,
      type: 'actions',
      column_width: '100',
         url: "",
        order_no: 0
    },
  ]);
   const [selectedAD, setSelectedAD] = useState<number|string | undefined>();
     const [submitted, setSubmitted] = useState(false);
  const showAlert = (message: string) => {
    setMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setMessage("");
    //navigation("/PMView");
  };
  const fetchData = async () => {
    try {
      
      const response = await GetADIntegrationsForCustomer(customerId);
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === 'success') setAdList(parsedRes.data);
      
     
    } catch (err) {
      //console.log('Error Fetching Users', err);
    }
  };
    const fetchADList = async () => {
    try {
      //console.log('hi');
      const response = await GetADList();
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === 'success') setAd(parsedRes.data);
      // else
      // console.error(
      //   'Failed to fetch AD:',
      //   parsedRes.message || 'Unknown error',
      // );
    } catch (err) {
      //console.log('Error Fetching Users', err);
    }
  };
  const handleDeleteAD = async (projectTeamId: number) => {
      if (!projectTeamId) {
        console.error('Invalid Milestone ID');
        return;
      }
  
      try {
        // Create the payload
        /*  const payload = {
          raid_id: projectTeamId,
        }; */
  
        //console.log('Deleting Milestone with Payload:', payload);
  
        // Call the API function to delete the milestone
        const res = await DeleteAD(projectTeamId);
  
        //console.log('Delete API Response:', res);
        const parsedRes = JSON.parse(res);
  
        if (parsedRes.status === 'success') {
          // Refresh the milestone list after deletion
          fetchData();
          //Alert.alert('Success', 'Milestone deleted successfully');
        } else {
          throw new Error(parsedRes.message || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Error in handleDelete:', error);
        //Alert.alert('Error', 'Failed to delete milestone. Please try again.');
      } finally {
       // setActiveMenu(null); // Close the menu after the operation
      }
    };
    const handleSave = async () => {
        debugger;
    let tempErrors: {[key: string]: string} = {};
    console.log('selectedAD ' + selectedAD);

    
    if (Object.keys(tempErrors).length > 0) return;

    const payload = {
      integration_customer_id: integrationCustId,
      integration_id: selectedAD,
      customer_id: '',
      client_id: clientId,
      client_secret: clientSecret,
      tenant_id: tenantId,
      created_by: '',
      description: integrationName,
      domain_name: domainName,
      auth_key: apiKey,
    };
    try {
      const response = await AddADForCustomer(payload);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === 'success') {
        //console.log('AD Added succesfully');
        //setResultDialog(true);
        setIsModalVisible(false);
        showAlert('Details updated successfully');
        fetchData();
        //onClose();
      } else console.error('Failed', parsedRes.message || 'Unknown error');
    } catch (err) {
      //console.log('Error Fetching Users', err);
    }
    //console.log('Payload being sent:', JSON.stringify(payload));
    //setIsLoading(true);
  };
  const location = useLocation();
  const navigation = useNavigate();
   const [integrationName, setIntegrationName] = useState(
    "",
  );
   const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [tenantId, setTenantId] = useState("");
   const [domainName, setDomainName] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
   const [integrationCustId, setIntegrationCustId] = useState('');
     const [integrationId, setIntegrationId] = useState('');
     const {theme} =useTheme();
  useEffect(() => {
    (async function () {
        fetchADList();
       fetchData();
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <div className="min-w-[1000px]">
          <AdvancedDataTable
            actions={(item) => (
              <div className="flex space-x-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          console.log("View", item);
                          setIntegrationCustId(item.integration_customer_id);
              setIntegrationName(item.description);
              setClientId(item.client_id);
              setClientSecret(item.client_secret);
              setTenantId(item.tenant_id);
              setIntegrationId(item.integration_id);
              setSelectedAD(item.integration_id);
              setDomainName(item.domain_name);
              setApiKey(item.auth_key);
                          setIsModalVisible(true);

                        }}
                      >
                        <EditSVG height={22} width={22} className="[&_path]:fill-white"/>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{"Edit"}</TooltipContent>
                  </Tooltip>
                   <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => {
                                            console.log("View", item);
                                            if(confirm("Are you sure you want to delete this Integration"))handleDeleteAD(parseInt(item.integration_customer_id ?? '', 10));
                                          }}
                                        >
                                          <DeleteSVG height={22} width={22} className="[&_path]:fill-white"/>
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>{"Delete"}</TooltipContent>
                                    </Tooltip>
              </div>
            )}
         
            data={adList}
            columns={headers}
            title="Ad Int"
            exportFileName="AD"
            isCreate={true}
            onCreate={() => {
              setIntegrationName("");
              setClientId("");
              setClientSecret("");
              setTenantId("");
              setIntegrationId("");
              setSelectedAD("");
              setDomainName("");
              setApiKey("");
                          setIsModalVisible(true);}}
            isPagingEnable={true}
            PageNo={1}
            TotalPageCount={1}
            
            data_type={"Active Directory (AD)"}
          />
        </div>
        {isModalVisible && <><div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Active Directory (AD) Integrations</h2>

        {/* Form */}
        <form method="post" className="space-y-4"  
        onSubmit={(e) => {
            //alert("bvmbmvm");
              e.preventDefault();
              setSubmitted(true);
              handleSave();
              //handleSubmit();

              //handleAddMemberClickonsubmit();
            }}
            
            
            >
          {/* AD Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AD Selection <span className="text-red-500">*</span>
            </label>
            
            <select
                  className="w-full mt-1 p-2 border rounded"
                  required
                  onChange={(e) => setSelectedAD(parseInt(e.target.value))}
                  value={selectedAD}
                >
                  <option value="">AD Selection Type</option>
                  {(ad ?? []).map((item) => (
                    <option
                      key={item.integration_id}
                      value={item.integration_id?.toString()}
                    >
                      {item.integration_name}
                    </option>
                  ))}
                </select>
                {/* {submitted && !selectedAD && (
                <p className="text-red-500 text-sm mt-1">
                  Select AD Provider
                </p>
              )} */}
          </div>

          {/* Integration Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Integration Name <span className="text-red-500">*</span>
            </label>
            <input
             required
             value={integrationName}
             onChange={(e) => {
                     setIntegrationName(e.target.value)
                    }}
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Integration Name"
            />
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID <span className="text-red-500">*</span>
            </label>
            <input
             required
              onChange={(e) => {
                     setClientId(e.target.value)
                    }}
              value={clientId}
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Client ID"
            />
          </div>

          {selectedAD===1 && <> {/* Client Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret <span className="text-red-500">*</span>
            </label>
            <input
             onChange={(e) => {
                     setClientSecret(e.target.value)
                    }}
             required
              value={clientSecret}
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Client Secret"
            />
          </div>

          {/* Tenant ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenant ID <span className="text-red-500">*</span>
            </label>
            <input
             onChange={(e) => {
                     setTenantId(e.target.value)
                    }}
             value={tenantId}
             required
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Tenant ID"
            />
          </div></>}
          {selectedAD===2 && <> {/* Domain Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Name <span className="text-red-500">*</span>
            </label>
            <input
             onChange={(e) => {
                     setDomainName(e.target.value)
                    }}
             required
             value={domainName}
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Domain Name"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key <span className="text-red-500">*</span>
            </label>
            <input
             onChange={(e) => {
                     setApiKey(e.target.value)
                    }}
            value={apiKey}
             required
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter API Key"
            />
          </div></>}
{/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={()=>{setIsModalVisible(false)}}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
          type="submit"
            onClick={()=>{setSubmitted(true)}}
            className="px-4 py-2 rounded-md text-white" style={{backgroundColor:theme.colors.drawerBackgroundColor}}
          >
            Save
          </button>
        </div>
        </form>

        
      </div>
    </div></>}
        <AlertBox
          visible={alertVisible}
          onCloseAlert={closeAlert}
          message={message}
        />
      </div>
    </div>
  );
};

export default ADIntegrationList;
