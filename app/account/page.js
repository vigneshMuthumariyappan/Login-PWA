"use client"
import { getCookie, setCookies } from "@/helper/setcookies";
import { useEffect, useState } from "react"
import Skeleton from 'react-loading-skeleton'
import Link from "next/link";

const page = () => {
  const [isLogin, setIsLogin] = useState([]);
  const [isLoading, setIsLoading] = useState(false)   
  useEffect(() => {
    try {
      const TOKEN = getCookie('TOKEN')
      if (!TOKEN) {
          setIsLogin('error');
          return;
      }
        setIsLoading(true)
        fetch(process.env.userDetail,{
            method:'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${TOKEN}`
            },
        })
        .then(res=>res.json())
        .then(json => {
            setIsLogin(json);
        })
        .finally(() => {
          setIsLoading(false)
        })
        
    } catch (error) {
        console.log(error)
    }
  }, [])
  return (
    <div className="custom-container">
      <div className="form">
        <div style={{width: '100%', whiteSpace: "normal"}}>
          {isLogin !== 'error' && 
          <Link style={{display: 'block'}} href={'/'}>Go Home <br/></Link>
          }
          {isLogin === 'error' && <span>You must login 
            <Link href={'/'} >  click here</Link></span>}
          {isLoading && <Skeleton count={4} /> }
          {!isLoading && isLogin.length !== 0 &&  isLogin !== 'error'
          && <>
              <span>
                {JSON.stringify(isLogin)}
                <br />
                <Link href={'/ble'}>BLE file transfer</Link>
                <p style={{color: 'red', cursor: 'pointer'}} onClick={(e) => {
                setCookies('TOKEN', '', 0);
                location.reload() }}>Logout</p></span>
              </>}
        </div>
      </div>
    </div>
  )
}
export default page