import {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function LoginPage() {

  const [form,setForm]=useState({email:"",password:"",role:"user"})
  const [loading,setLoading]=useState(false)
  const navigate=useNavigate();
  
  const handleChange=(e) =>{
    setForm({...form, [e.target.name]:e.target.value})
  }

  const handleLogin=async(e)=>{
    e.preventDefault()
    setLoading(true)
    try {
      const res=await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(form)
      })
      const data=await res.json()
      if(res.ok){
        if(data.user.role !== form.role){
          alert(`Role mismatch: your account is ${data.user.role}. Please select the correct role before logging in.`)
          setLoading(false)
          return
        }
        localStorage.setItem("token",data.token)
        localStorage.setItem("user",JSON.stringify(data.user))
        navigate(data.user.role === "admin" ? "/admin" : "/")
      }else{
        alert(data.message || data.error || "Login Failed")
      }
    } catch (error) {
        alert("Login-something went wrong");
        console.error(error);
      
    }
    finally{
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <form onSubmit={handleLogin} className="card-body">
          <h2 className="card-title justify-center">Login</h2>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input input-bordered"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input input-bordered"
            value={form.password}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="select select-bordered"
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          <div className="form-control mt-4">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}