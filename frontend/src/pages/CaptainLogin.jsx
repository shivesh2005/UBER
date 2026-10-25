import React ,{useState} from 'react'
import {Link} from 'react-router-dom'
const CaptainLogin = () => {
    const [email , setEmail] = useState('');
    const [password , setPassword] = useState('');
    const [CaptainData , setCaptainData] = useState('');
    const submitHandler = (e) => {
      e.preventDefault();
      setCaptainData({
        email:email,
        password:password
      })
      setEmail('')
      setPassword('')
    }
  return (
  <div className="p-7 h-screen flex flex-col justify-between">
       <div>
         <img
           className="w-16 mb-10"
           src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
           alt="Uber"
         />
 
         <form onSubmit={(e) => {
           submitHandler(e)
         }}>
           <h3 className="text-lg font-medium mb-2">
             What's your email
           </h3>
 
           <input
             required
             name="email"
             value={email}
             onChange={(e) => {
               setEmail(e.target.value)
             }}
             className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
             type="email"
             placeholder="email@example.com"
           />
 
           <h3 className="text-lg font-medium mb-2">
             Enter Password
           </h3>
 
           <input
             required
             name="password"
             value={password}
             onChange={(e) => {
               setPassword(e.target.value)
             }}
             className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
             type="password"
             placeholder="password"
           />
 
           <button
             type="submit"
             className="bg-[#111] text-white font-semibold mb-7 rounded px-4 py-2 w-full text-lg"
           >
             Login
           </button>
         </form>
 
         <p className="text-center">
          Join a fleet? {' '}
           <Link to="/captain-signup" className="text-blue-600">
             Register as a captain
           </Link>
         </p>
       </div>
 
       <div>
        
           <Link
             to = '/login'
             type ="button"
             className="bg-[#d56224] flex items-center justify-center text-white font-semibold mb-5 rounded px-4 py-2 w-full text-lg"
           >
             Sign in as User
           </Link>
         
       </div>
     </div>
  )
}

export default CaptainLogin;
