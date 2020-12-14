
 /* Utility Modules*/
 import React,{useState,useEffect} from 'react'
 import {Jumbotron,Alert,Container,Card} from 'react-bootstrap'
 import {CloudUpload} from 'react-bootstrap-icons'
 import axios from 'axios'
 import {useHistory} from 'react-router-dom'

/* Components */
 import Loading from '../AdditionalComponents/Loading';



/*extra import*/


function AddFiles({refreshFilesFunc,accessToken,currShowAllFiles}) {

    const history                          = useHistory();
    const [uploadedFiles,setuploadedFiles] = useState([]);
    const [filesInfo,setfilesInfo]         = useState([]);
    const [valid4upload,setvalid4upload]   = useState(false);
    const [utilityStates,setUtilityStates] = useState({
        alert:'',
        variant:'',
        showAlert:false
    })
    const [loading,setLoading]             = useState(false);


    useEffect(() => {
        let localStorageName = process.env.REACT_APP_LOCAL_NAME;
        let user = JSON.parse(localStorage.getItem(localStorageName));
        if(!user){
            history.push('/login');
        }
    })
    /**
     * 
     * @param {*} e : validate files before uploading 
     */
    const handleFileChanges = (e)=>{

        setUtilityStates({alert:'',variant:'',showAlert:false});
        setuploadedFiles([]);

        const files = e.target.files;

        // check for file length
        if(files.length>5 || files.length<1){
            setUtilityStates({
                alert:'Slected files should be in the range of 1-5 only',
                variant:'warning',
                showAlert:true
            })

            return;
        }

        
        let totalSize = 0;
        let filesInfo = [];

        for(let i=0;i<files.length;i++){
            filesInfo.push({name:files[i]['name'],size:files[i].size});
            totalSize+=files[i].size;
        }

        // check for file upload size
        totalSize = (totalSize)/(Math.pow(10,6));
        if(totalSize<0 || totalSize>20){
            setUtilityStates({
                alert:'Invalid file size (0-20] Mb only',
                variant:'warning',
                showAlert:true
            })

            return;
        }

        setfilesInfo([...filesInfo]);

        // setting actual files
        const actualFiles = [];
        for(let i=0;i<files.length;i++){
            actualFiles.push(files[i]);
        }

        setuploadedFiles([...actualFiles]);
        setvalid4upload(true);
    }

    
    /**
     * Upload files if they are valid
     */
    const handleUploads = ()=>{

        //check if valid for upload
        if(!valid4upload){
            return;
        }

        let formData = new FormData();
        formData.append('myFiles', uploadedFiles[0]);

        const URL_PREFIX = process.env.REACT_APP_SERVER_URL_PREFIX;
        const URL = `${URL_PREFIX}/files/add`;

        // start loading
        setLoading(true);

        axios.post(URL,formData,{
            headers: {
                'authorization': `Token ${accessToken}`,
                'Content-type': 'multipart/form-data'
            }
        })
            .then(response=>{
                // reset choose file field
                document.getElementById("chooseFileBtn").value = "";

                setUtilityStates({
                    alert:'File(s) Upload Successful',
                    variant:'success',
                    showAlert:true
                });

                // stop loading
                setLoading(false);

                setuploadedFiles([]);
                setfilesInfo([]);
                //setting refresh to true
                refreshFilesFunc(!currShowAllFiles);
            })
            .catch(error=>{
                const errMsg = error.response ? (error.response.data.errors.message):('Unknown Error Occured');

                setUtilityStates({
                    variant:'danger',
                    alert:errMsg,
                    showAlert:true
                });

                // stop loading
                setLoading(false);
            })
    };

    return (
        <Jumbotron id="addFilesContainer" style={{padding: "1rem",margin: "auto",background: "none"}}>
            <Loading show={loading}/>
            <Alert 
                variant={utilityStates.variant} 
                id="fileAlert"
                show={utilityStates.showAlert}
                onClose={() => setUtilityStates({showAlert:false})} 
                style={{textAlign:'center'}}
                dismissible
            >
                {utilityStates.alert}
            </Alert>

            <div id="uploadForm">
                <form encType='multipart/form-data'>
                    <input type="file" name="myFiles" multiple onChange={handleFileChanges} id="chooseFileBtn"/>
                </form>
            </div>

            <Container fluid>
                {
                    filesInfo.length ? (
                        filesInfo.map((file,index)=>{
                            return (
                            <Card key={index+1} className='uploadFileDetCard' sm={3} md={2} style={{margin:"0.5rem auto"}}>
                                <Card.Title>{file.name}</Card.Title>
                                <Card.Text>{((file.size)/Math.pow(10,6))} Mb</Card.Text>
                            </Card>
                            )
                        })
                    ):(
                        <Card className='uploadFileDetCard' sm={3} md={2} style={{margin:"0.5rem auto"}}>
                            <Card.Title>Select Files To Upload</Card.Title>
                            <Card.Text>
                                Click on choose button and then select one 
                                or more files 
                                (max 5 only and overall size should be less than 20Mb)
                            </Card.Text>
                        </Card>
                    )
                }
            </Container>

            <Container fluid id="fileUploadBtnContainer">
                <CloudUpload 
                    style={{margin:'1rem auto', cursor:"pointer"}} 
                    onClick={handleUploads}
                    id="fileUploadBtn"
                />    
            </Container>    

        </Jumbotron>
    )
}

export default AddFiles
