import React,{useState, useEffect} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import docService from '../appwrite/authDoc'
import NotfCard from "./NotfCard"
import RefreshIcon from '@mui/icons-material/Refresh';
import { dark } from '@mui/material/styles/createPalette'
import { toast } from 'react-toastify'

function Notification() {

    const [requests, setRequests] = useState([])
    const [post, setPost] = useState(null)
    const { slug } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (slug) {
            docService.getPost(slug).then((post) => {
                if (post) {
                    const data = Array.isArray(post.requests) ? post.requests : []
                    setRequests(data)
                    setPost(post)
                }
                else navigate("/");
            });
        } 

    }, [slug, navigate]);

    useEffect(() => {

        return () => {};
    }, []);

    const acceptRequest = async (userid, roomid) => {
        const index = requests.findIndex((e) => e.userid == userid)
        requests[index].callId = `/video/${roomid}`;
        requests[index].confirm = true;

        await docService.updateRequests(post._id, requests).then((status) => {
            status && console.log("Accepted succesfully");
        });
    }

    const rejectRequest = (id) => {
        
        const updatedRequests = requests.filter((e) => e.userid != id)
        setRequests(updatedRequests);

        docService.updateRequests(post._id, updatedRequests).then((status) => {
            status && toast.error("Rejected succesfully");
        });
    }
    


  return requests?.length ? (
    <div>
        {requests.map((data) => (
            <div key={data.userid}>
                <NotfCard {...data} rejectRequest={rejectRequest} 
                acceptRequest={acceptRequest} />
            </div>
        ))}
    </div>
  ) : (
    <div className="flex-col w-full my-2 flex items-center justify-center">
        <div className="w-8 h-8 border-4 text-blue-400  animate-spin
        border-gray-300 border-t-blue-400 rounded-full">
            
        </div>
        <h1 className='text-xl'>loading...</h1>
    </div>
  )
}

export default Notification
