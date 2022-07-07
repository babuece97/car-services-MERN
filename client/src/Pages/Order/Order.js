import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import auth from '../../firebase.init';

const Order = () => {
    const [user]=useAuthState(auth);
    const [orders, setOrders]=useState([]);// default value in array
    useEffect(()=>{
        const getOrders = async()=>{
            const email =user.email;
            const url =`http://localhost:5000/order?email=${email}`;
            const {data}=await axios.get(url);
            setOrders(data);
        }
        getOrders();

    },[user])
    return (
        <div>
            <h2>my orders:{orders.length} </h2>
        </div>
    );
};

export default Order;