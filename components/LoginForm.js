'use client'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCookie, getOnedayFuture, setCookies } from '@/helper/setcookies';
import { useRouter } from 'next/navigation'

function LoginForm() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginUser, setIsLoginUser] = useState(false);
    const router = useRouter();
    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        try {

            fetch(process.env.customerToken,{
                method:'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            .then(res=>res.json())
            .then(json => {
                if (json.access_token) {
                    setCookies('TOKEN', json.access_token, getOnedayFuture());
                    router.push('/account')
                    return;
                }
                alert(json.message);

            })
            
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        const token = getCookie('TOKEN');
        if (token) setIsLoginUser(true);
    }, [])
    return (
        <>
            {isLoginUser && <div className='form'>
                    <span><Link href={'/account'}>Go to account page</Link></span>
                    <span><p style={{color: 'red', cursor: 'pointer'}} onClick={(e) => {
                        setCookies('TOKEN', '', 0);
                        location.reload() }}>Logout</p></span>
                </div>}

            {
                !isLoginUser &&

            <Form className='form' onSubmit={handleLoginSubmit}>
                <h4 className="mb-3">
                    Login PWA
                </h4>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} required/>
                <Form.Text className="text-muted">
                We'll never share your email with anyone else.
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required/>
            </Form.Group>
            <Button variant="primary" type="submit">
                Login
            </Button>
                <Link className='ps-3' href={'/registration'}>Go to Registration</Link>
            </Form>
            }
        </>
    );
}

export default LoginForm;