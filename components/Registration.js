'use client'

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {useRouter} from 'next/navigation';

function Registration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isConfirmPassword, setIsConfirmPassword] = useState(false);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [passwordValid, setPasswordValid] = useState(false);
    const router = useRouter();

    const handleResister = (e) => {
        e.preventDefault()
        setPasswordValid(false);
        setIsConfirmPassword(false)
        console.log(password.length>= 8);
        if (password.length < 8) {
            setPasswordValid(true);
            return
        }

        if (password !== confirmPassword) {
            setIsConfirmPassword(true);
            return
        }
        try {
            fetch(process.env.users,{
                method:'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: firstname+' '+lastname,
                    email: email,
                    password: password,
                    avatar: 'http://test.com'
                })
            })
            .then(res => res.json())
            .then( res=> {
                if (res && res.id) {
                    alert('success');
                    router.push('/');
                } else {
                    alert(res.message);
                }
            })
        } catch (error) {
            console.error(error);
        }
        
    }
    return (
        <Form className='form' onSubmit={handleResister}>
            <h3 className="mb-3">
                Registration
            </h3>
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" required
            value={email} onChange={(e) => setEmail(e.target.value)}/>
            <Form.Text className="text-muted">
            We'll never share your email with anyone else.
            </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" placeholder="firstname" required
            value={firstname} onChange={(e) => setFirstname(e.target.value)}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" placeholder="lastname" required
            value={lastname} onChange={(e) => setLastname(e.target.value)}/>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" required
            value={password} onChange={(e) => setPassword(e.target.value)} 
            />
            {passwordValid && <span style={{color: 'red'}}>Password length must be greater than 8</span>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" placeholder="confirm password" required
               value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
               {isConfirmPassword && <span style={{color: 'red'}}>Password not match</span>}
        </Form.Group>
        <Button variant="primary" type="submit">
            Register
        </Button>
        </Form>
    );
}

export default Registration;