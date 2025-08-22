import AlertBox from "@/components/ui/AlertBox";
import { SubmitDetails } from "@/services/rest_api_service";
import { useTheme } from "@/themes/ThemeProvider";
import { GetCustomers, GetCustomersImage, GetMailer, UpdateCustomer, UpdateMailer } from "@/utils/Customer";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;
interface CompanyProfileProps {
  onCompanyUpdate?: (companyName: string) => void;
}

const CompanyDetailPage: React.FC<CompanyProfileProps> = ({
  onCompanyUpdate,
}) => {
 const [imageUri, setImageUri] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [customerID, setCustomerID] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNamePMO, setFirstNamePMO] = useState('');
  const [lastNamePMO, setLastNamePMO] = useState('');
  const [projectPrefix, setProjectPrefix] = useState('');
  const [email, setEmail] = useState('');
  const [companyDetail, setCompanyDetail] = useState({});
  const [modular_id, setModular_id] = useState('');
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [mailerDetail, setMailerDetail] = useState({});
  const [isActive, setIsActive] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState(''); // Holds the selected image data
  const [loading, setLoading] = useState(false);


  const [smtpHost, setSmtpHost] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
 const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage('');
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (fieldName: string, value: string) => {
    let errorMessage = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z0-9\s]+$/;

    switch (fieldName) {
      case "companyPhone":
        if (!/^[0-9]*$/.test(value)) {
          errorMessage = "Phone should contain only numbers";
        }
        break;
      case "companyName":
        if (!nameRegex.test(value)) {
          errorMessage = "Company Name should only contain letters/numbers";
        }
        break;
      case "companyEmail":
        if (!emailRegex.test(value)) {
          errorMessage = "Enter a valid email address";
        }
        break;
      case "projectPrefix":
        if (value.length > 3) {
          errorMessage = "Max 3 characters allowed";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
  };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const fileUrl = URL.createObjectURL(file);
//       debugger;
//       setImageUri(fileUrl);
//       const imageDataPayload = {
//         fileuri: fileUrl,
//         fileName: file.name || 'uploaded_image.jpg',
//       };

//       // Upload the image directly after selection
//       try {
//         const response = await uploadImage(imageDataPayload);
//         console.log('Success: Image uploaded successfully!', response);
//       } catch (uploadError) {
//         console.error('Upload failed:', uploadError);
//       }
//     }
//   };
//   const uploadImage = async (imageData: any): Promise<string> => {
//     try {
//       //////debugger
//       // Step 1: Get the Bearer token
//       setLoading(true);
//       const bearerToken =  localStorage.getItem('Token');
//       if (!bearerToken) {
//         console.log('Authorization token is missing.', bearerToken);
//       }
//       console.log('out of !bearerToken.', bearerToken);

//       const formData = new FormData();
//       const blob = base64ToBlob(imageData.fileuri);
//       //blob.name = imageData.fileName || 'uploaded_image.jpg';
//       formData.append(
//         'image',
//         base64ToBlob(imageData.fileuri ?? ''),
//         imageData.fileName,
//       );
//       formData.append('field1', 'value1');
//       //formData.append('image', blob);
//       const url = `${BASE_URL}/common/upload_image`;
//       var jsonResult = await SubmitDetails(url, formData);
//       setImage(jsonResult.data.file_name);
//       console.log('SET IMAGE', jsonResult.data.file_name);
//       setLoading(false);

//       return 'Uploaded';
//     } catch (error) {
//       setLoading(false);
//       console.error('Error during upload:', error);
//       setImageUri(imageUri);
//       showAlert(
//         'Unsupported file type. Allowed types: jpeg, jpg, png, gif, ttf.\nImage size should be less than 1 MB',
//       );

//       throw new Error(`Failed to upload image: ${error}`);
//     }
//   };
// function base64ToBlob(base64: string): Blob {
//     // Check if the base64 string includes a Data URI prefix
//     const hasDataUriPrefix = base64.startsWith('data:');
//     let byteString, mimeString;

//     if (hasDataUriPrefix) {
//       const splitDataURI = base64.split(',');
//       byteString =
//         splitDataURI[0].indexOf('base64') >= 0
//           ? atob(splitDataURI[1])
//           : decodeURI(splitDataURI[1]);
//       mimeString = splitDataURI[0].split(':')[1].split(';')[0];
//     } else {
//       // Fallback for missing prefix
//       byteString = atob(base64);
//       mimeString = 'image/jpeg'; // Default MIME type (adjust as needed)
//     }

//     // Create a Uint8Array from the byte string
//     const ia = new Uint8Array(byteString.length);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }

//     return new Blob([ia], {type: mimeString});
//   }
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setImageUri(URL.createObjectURL(file));

    const imageDataPayload = {
      file, // pass the actual File object
      fileName: file.name || 'uploaded_image.jpg',
    };

    try {
      const response = await uploadImage(imageDataPayload);
      console.log('Success: Image uploaded successfully!', response);
    } catch (uploadError) {
      console.error('Upload failed:', uploadError);
    }
  }
};
const uploadImage = async (imageData: any): Promise<string> => {
  try {
    setLoading(true);
    const bearerToken = localStorage.getItem('Token');

    const formData = new FormData();
    formData.append('image', imageData.file, imageData.fileName);
    formData.append('field1', 'value1');

    const url = `${BASE_URL}/common/upload_image`;
    const jsonResult = await SubmitDetails(url, formData);

    setImage(jsonResult.data.file_name);
    setLoading(false);
    return 'Uploaded';
  } catch (error) {
    setLoading(false);
    console.error('Error during upload:', error);
    setImageUri(imageUri);
    showAlert('Unsupported file type...');
    throw new Error(`Failed to upload image: ${error}`);
  }
};
  const handleSave = async () => {
    if (Object.values(errors).some((err) => err)) return;

    setSubmitting(true);

const payload = {
      ...companyDetail, // Spread the rest of the companyDetail properties
      company_name: companyName, // Override company_name with this value
      phone: companyPhone, // Override phone with this value
      customer_id: parseInt(customerID), // Explicitly add customer_id
      default_approval_email: email,
      first_name: firstName,
      last_name: lastName,
      is_active: true,
      file_name: image,
      default_approval_first_name: firstNamePMO,
      default_approval_last_name: lastNamePMO,
      project_prefix: projectPrefix,
      email: companyEmail,
    };

    const payloadmailer = {
      ...mailerDetail,
      modular_id: modular_id,
      smtp_host: smtpHost,
      smtp_user: smtpUser,
      smtp_password: smtpPass,
      smtp_port: smtpPort,
      is_active: isActive,
      mailer_type: 'smtp',
    };

    try {
      console.log(payload);
      console.log('consoling mailer api', payloadmailer);

      const response1 = await UpdateCustomer(payload); // Call the API with the payload
      const response2 = await UpdateMailer(payloadmailer); //call for API customer mailer
      const parsedRes1 = JSON.parse(response1);
      const parsedRes2 = JSON.parse(response2);

      if (parsedRes1.status === 'success' && parsedRes2.status === 'success') {
        console.log('User Added Successfully');
        showAlert('Company details updated successfully');

         localStorage.setItem('company_name', companyName || ''); //setting company name
        if (onCompanyUpdate) {
          onCompanyUpdate(companyName); // Notify parent component
        }

        // handleFetchCustomers();
      } else {
        console.error(
          'Failed to add user:',
          parsedRes1.message || 'Unknown error',
        );
        showAlert('Failed to add company details');
      }
    } catch (err) {
      console.error('Error Adding User:', err);
      showAlert('Failed to add company details');
    } finally {
      setSubmitting(false); // Re-enable button after save
    }

    // const payload = {
    //   companyName,
    //   companyEmail,
    //   companyPhone,
    //   projectPrefix,
    //   smtpHost,
    //   smtpUser,
    //   smtpPass,
    //   smtpPort,
    //   isActive,
    // };

    // console.log("Saving payload:", payload);
    // setTimeout(() => {
    //   setSubmitting(false);
    //   if (onCompanyUpdate) onCompanyUpdate(companyName);
    //   alert("Company details saved successfully!");
    // }, 1500);
  };
  const handleFetchCustomers = async () => {
    const res = await GetCustomers(); // Assuming GetCustomers returns a stringified response
    try {
      const parsedRes = JSON.parse(res); // Parse the stringified response
      console.log('GET CUSTOMER', parsedRes);

      if (
        parsedRes.status === 'success' &&
        parsedRes.data?.customers?.length > 0
      ) {
        const customers = parsedRes.data.customers;
        const customer = customers[customers.length - 1]; // Get the first customer
        console.log('GET CUSTOMER', customer);
        setCompanyName(customer.company_name || '');
        setCompanyEmail(customer.email || '');
        setCompanyPhone(customer.phone || '');
        setCustomerID(customer.customer_id || '');
        setFirstName(customer.first_name || '');
        setLastName(customer.last_name || '');
        setFirstNamePMO(customer.contact_first_name || '');
        setLastNamePMO(customer.contact_last_name || '');
        setProjectPrefix(customer.project_prefix || 'FPX');
        setEmail(customer.tech_admin_email || '');
        //setEmail(customer.default_approval_email || '');
        setImage(customer.file_name || '');
        setCompanyDetail({
          company_name: customer.company_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          customer_id: customer.customer_id || '',
          address: customer.address || '',
          industry: customer.industry || '',
          tech_admin_email: customer.tech_admin_email || '',
          language_preference: customer.language_preference || '',
          terms_conditions: customer.terms_conditions || '',
          privacy_policy: customer.privacy_policy || '',
        });
        // //////debugger
        // const fetchedUri = await GetCustomersImage(
        //   'e0ea7266-8a9c-41ca-8340-bd9752b05cbf.jpeg',
        // );

        // if (fetchedUri) {
        //   setImageUri(fetchedUri);
        // }
        if (customer.file_name && customer.file_name !== '') {
          setLoading(true);
          const fetchedUri = await GetCustomersImage(customer.file_name);
          if (fetchedUri) {
            setImageUri(fetchedUri);
          } else {
            setImageUri(''); // Fallback if fetch fails
          }
        } else {
          setImageUri(''); // Default image if no file name
        }
        setLoading(false);
      } else {
        setLoading(false);
        console.error('No customer data available or API failed');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error parsing customer data:', error);
    }
  };
 const handleFetchMailer = async () => {
    try {
      const res = await GetMailer('');
      const parsedRes = JSON.parse(res); // Parse the response

      if (parsedRes.status === 'success' && parsedRes.data) {
        const customerMailer = parsedRes.data;

        console.log('Mailer Data:', customerMailer);

        // Update state with API response
        setSmtpHost(customerMailer.smtp_host || '');
        setSmtpUser(customerMailer.smtp_user || '');
        setSmtpPass(customerMailer.smtp_password || '');
        setCustomerID(customerMailer.customer_id || '');
        setModular_id(customerMailer.customer_id || '');
        setSmtpPort(customerMailer.smtp_port || '');

        // Set mailer details
        setMailerDetail({
          mailer_id: customerMailer.mailer_id || '',
          mailer_type: customerMailer.mailer_type || '',
          smtp_host: customerMailer.smtp_host || '',
          smtp_user: customerMailer.smtp_user || '',
          smtp_password: customerMailer.smtp_password || '',
          smtp_port: customerMailer.smtp_port || 587,
          smtp_secure: customerMailer.smtp_secure || false,
          created_at: customerMailer.created_at || '',
          updated_at: customerMailer.updated_at || '',
          is_active: customerMailer.is_active || false,
        });
      }
    } catch (error) {
      console.error('Error fetching mailer data:', error);
    }
  };

 const location = useLocation();
  const navigation = useNavigate();
  const {theme} =useTheme();
  useEffect(() => {
    (async function () {
       handleFetchCustomers();
       handleFetchMailer();
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="p-6 bg-gray-50 w-full h-full overflow-auto">
      <div className=" mx-auto bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6  text-blue-600">Company Details</h2>

        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                validateField("companyName", e.target.value);
              }}
              className="w-full border rounded-lg p-2"
              placeholder="Enter Company Name"
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Company Email</label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => {
                setCompanyEmail(e.target.value);
                validateField("companyEmail", e.target.value);
              }}
              className="w-full border rounded-lg p-2"
              placeholder="Enter Company Email"
            />
            {errors.companyEmail && (
              <p className="text-red-500 text-sm">{errors.companyEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Company Phone</label>
            <input
              type="text"
              value={companyPhone}
              onChange={(e) => {
                setCompanyPhone(e.target.value);
                validateField("companyPhone", e.target.value);
              }}
              className="w-full border rounded-lg p-2"
              placeholder="Enter Company Phone"
            />
            {errors.companyPhone && (
              <p className="text-red-500 text-sm">{errors.companyPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Project Prefix</label>
            <input
              type="text"
              value={projectPrefix}
              onChange={(e) => {
                setProjectPrefix(e.target.value);
                validateField("projectPrefix", e.target.value);
              }}
              className="w-full border rounded-lg p-2"
              placeholder="Prefix (max 3 chars)"
            />
            {errors.projectPrefix && (
              <p className="text-red-500 text-sm">{errors.projectPrefix}</p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mt-6 flex items-center gap-4">
          {imageUri ? (
            <img
              src={imageUri}
              alt="Company"
              className="w-24 h-24 rounded-lg object-cover border"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg border flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          <input type="file" onChange={handleFileChange} />
        </div>
 {/* SMTP Details */}
        <h2 className="text-xl font-semibold mt-8 mb-4 text-blue-600">PMO Admin</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-1">First Name</label>
            <input
              type="text"
               disabled
              value={firstNamePMO}
              onChange={(e) => { setFirstNamePMO(e.target.value);
                validateField("firstNamePMO", e.target.value);}}
              className="w-full border rounded-lg p-2"
              placeholder="Enter First Name"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 ">Last Name</label>
            <input
             disabled
              type="text"
              value={lastNamePMO}
              onChange={(e) => {const sanitizedText = e.target.value.replace(/[^A-Za-z\s]/g, '');
                setLastNamePMO(sanitizedText);
                validateField('lastNamePMO', sanitizedText);}}
              className="w-full border rounded-lg p-2"
              placeholder="Enter Last Name"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
            disabled
              type="email"
              value={email}
              onChange={(e) => {setEmail(e.target.value);
                validateField('email', e.target.value);}}
              className="w-full border rounded-lg p-2"
              placeholder="Enter Email"
            />
          </div>

          
        </div>
        {/* SMTP Details */}
        <h2 className="text-xl font-semibold mt-8 mb-4  text-blue-600" >SMTP Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-1">SMTP Host</label>
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              className="w-full border rounded-lg p-2"
              placeholder="Enter SMTP Host"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">SMTP User</label>
            <input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className="w-full border rounded-lg p-2"
              placeholder="Enter SMTP User"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">SMTP Password</label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              className="w-full border rounded-lg p-2"
              placeholder="Enter SMTP Password"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">SMTP Port</label>
            <input
              type="text"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className="w-full border rounded-lg p-2"
              placeholder="Enter SMTP Port"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span>Active</span>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            className="px-6 py-2 rounded-lg border border-gray-400 text-gray-600 hover:bg-gray-100"
            onClick={() => navigation('/Adminpanel')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className={`px-6 py-2 rounded-lg text-white `} style={{backgroundColor:theme.colors.drawerBackgroundColor}}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
        <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </div>
  );
};

export default CompanyDetailPage;
