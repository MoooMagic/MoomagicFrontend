import React, { useState, useEffect } from 'react'
import './ProductPage.css'
// Axios
import axios from 'axios'

// Use Params for ID
import { useParams } from 'react-router-dom';

// Buy Now Icon
import FlashOnIcon from '@mui/icons-material/FlashOn';
// Cart Icon
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// Rupee
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
// Date
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// Money Icon
import MoneyIcon from '@mui/icons-material/Money';
// Card
import CreditCardIcon from '@mui/icons-material/CreditCard';
// Return
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
// Sell
import StorefrontIcon from '@mui/icons-material/Storefront';
// SweetAlert
import Swal from 'sweetalert2'
// UseNavigate
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader/Loader';

const ProductPage = (props) => {
    // UseNavigate
    const navigate = useNavigate();

    // Get ID from Route Params
    const { id } = useParams()

    // Use State for Per Product
    const [singleProduct, setsingleProduct] = useState(null)
    const [user, setUser] = useState(null);

    // Use Effect For Find Perticular Product
    useEffect(() => {
        props.loading.setLoading(true);
        axios.get(`https://moomagicapi.onrender.com/api/product/productid/${id}`)
            .then(res => {
                setsingleProduct(res.data)
                props.loading.setLoading(false);
                console.log(res.data)
            }).catch(err => {
                console.log(err)
            })
    }, [id])

    // Add to Cart Func
    const addToCart = () => {
        const token = localStorage.getItem('token')
        const userid = localStorage.getItem('userid')
        if (!token & !userid) {
            window.location.href = '/signin'
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please Login First!',
            })
            navigate('/login')
        } else {
            axios.post('https://moomagicapi.onrender.com/api/cart/addcart', {
                products: [{
                    product_id: id,
                    product_name: singleProduct.product_name || '',
                    product_desc: singleProduct.product_desc || '',
                    product_img: singleProduct.product_img || '',
                    quantity: 1,
                    price: singleProduct.price
                }]
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => {
                Swal.fire({
                    icon: 'success',
                    title: 'Added to Cart',
                    text: 'Product Added to Cart Successfully',
                })
            }).catch(err => {
                console.log(err)
            })

        }
    };
    useEffect(() => {
        const fetchUser = async () => {
            const userId=localStorage.getItem('userid')
            const token = localStorage.getItem('token')
          try {
            const res = await axios.get(`https://moomagicapi.onrender.com/api/auth/user/${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const { name, email, phonenumber } = res.data;
            setUser({ name, email, phonenumber });
          } catch (error) {
            console.log(error);
          }
        };
        fetchUser();
      }, []);
    const createorder = () => {
        const products = JSON.stringify(cartProd)
        axios.post('https://moomagicapi.onrender.com/api/razorpay/createorder',{
            amount:singleProduct.price,
            currency:'INR',
            receipt:'receipt#1',
            notes:{
                products:"Products"
            }
        }).then(res=>{
            handlePayment(res.data.data)
                Swal.fire({
                icon: 'success',
                title: 'Order Created',
                text: 'Order Created Successfully',
            })
           
        }).catch(err=>{
            console.log(err)
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                description: 'Server Error',
            })})
    }

    const handlePayment = (data) => {
        const options = {
            key:process.env.KEY,
            amount:data.amount,
            currency:data.currency,
            order_id:data.id,
            name:'MooMagic',
            description:'Indias Own Dairy Farm',
            image:'',
            
            handler:function(response){
                axios.post('https://moomagicapi.onrender.com/api/razorpay/verify',{
                    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature
                })
                .then(res=>{
                    if(res.data.status === '200'){
                        Swal.fire({
                            icon: 'success',
                            title: 'Payment Success',
                            text: 'Payment Successfull',
                        })}
                        else if(res.data.status === '400'){
                            Swal.fire({
                                icon: 'error',
                                title: 'Payment Failed',
                                text: 'Payment Failed',
                            })
                        }
                }).catch(err=>{
                    console.log(err)
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                })})
            },
            prefill:{
                name:user.name,
                email:user.email,
                contact:user.phonenumber
            },
            theme:{
                color:'#3399cc'
            },
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    };

    return (
        <>
            <div className="productPagePer">
               
                {
                    singleProduct && (
                        <div className="container">
                            <div className="row">
                                {/* Left Product Image Logo */}
                                <div className="col-md-4">
                                    <div className="imgPro">
                                        <img src={singleProduct.product_img} alt="" />
                                    </div>

                                    <div className="buttonPro">
                                        {
                                            singleProduct.createdBy === localStorage.getItem("userid") ? <></> : <button className='btn btn-outline-primary' onClick={createorder}> <FlashOnIcon /> Buy Now</button>
                                        }
                                        {
                                            singleProduct.createdBy === localStorage.getItem("userid") ? <></> : <button className='btn btn-success' onClick={addToCart}><ShoppingCartIcon /> Add to Cart</button>
                                        }

                                    </div>
                                </div>
                                {/* Right Product Image Details */}
                                <div className="col-md-6">
                                    {/* Product Name */}
                                    <h3>{singleProduct.product_name}</h3>
                                    {/* Product Desc */}
                                    <h6>{singleProduct.product_desc}</h6>
                                    {/* Per Price */}
                                    <div className="perPrice">
                                        <CurrencyRupeeIcon /> {singleProduct.price}
                                    </div>
                                    {/* Manufacture Date */}
                                    {/* Quantity */}
                                    <p>Quantity  <button className='perQuan'>{singleProduct.quantity}</button></p>
                                    {/* Services */}
                                    <p>
                                        Services
                                        <div className="delServ">
                                            <p><MoneyIcon /> Cash On Delivery</p>
                                            <p><CreditCardIcon /> By Card</p>
                                            <p><AssignmentReturnIcon /> Return Policy Available</p>
                                        </div>
                                    </p>

                                    {/* In Stock */}
                                    <button className='stock' style={{ backgroundColor: singleProduct.InStock ? 'dodgerblue' : 'rgb(255, 70, 45)' }}>{singleProduct.InStock ? 'Available' : 'Not Available'}</button>

                                    {/* Seller Details */}

                                </div>
                            </div>
                        </div>

                    )
                }
            </div>
        </>
    )
}

export default ProductPage
