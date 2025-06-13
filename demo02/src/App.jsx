


import React, { useReducer } from 'react'
import { Button } from 'react-bootstrap'

export default function App() {



  //1.
  //gom hết các state vào một chỗ
  //muốn thay đổi thì dùng hàm REDUCER
  //khai báo state bàn đầu
  const initState ={
    isLogin: false,
    name:'jason',
    role: 'guest'
  }
  //2.
  //khai báo reducer: nhận vào State
  //trả về state đã được cập nhật thông tin 
  //ACTION: quyết định state sẽ cập nhật kiểu nào
  const reducer = (state,action) => {
    switch (action.type) {
      case 'LOGIN' :
        return {isLogin: true,
        name: 'jason',
        role: 'admin'
        }
      

      case 'LOGOUT' :
        return {isLogin: false,
        name: 'jason',
        role: 'guest'
        }  
      default:
        return state
    }

    


  }
  //3. khai báo HOOK: userReducer
  //DISPATCH: báo chho reducer biết được hành động (action) nào được chọn
  const [state, dispatch] = useReducer(reducer, initState)
  return (
    <>
    <Button onClick={() => {

      dispatch({ type: 'LOGIN'})
      // setIsLogin(true)
      // setName('Jason')
      // setRole('admin')

    }}>Login</Button>


    <Button onClick={() => {
      dispatch({type: 'LOGOUT'})

    }}> Logout</Button>

    <h1>{state.isLogin ? `Welcome ${state.role}, ${state.name}`
    : `Please log in, ${state.name}`}</h1>
    
    </>
  )
}
