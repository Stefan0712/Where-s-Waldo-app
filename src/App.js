import React, { useEffect, useRef } from 'react';
import './app.css'
import {useState} from 'react'
import useMouse from '@react-hook/mouse-position'
import Characters from './Components/Characters';
import {db} from './firebase'
import {collection, docs, getDocs, doc, getDoc} from 'firebase/firestore'


function App() {
  let [limit1, setLimit1] = useState([])
  let [limit2, setLimit2] = useState([])
  let [limit3, setLimit3] = useState([])

  const lim1Ref = doc(db, "characters", "Character 1")
  const lim2Ref = doc(db, "characters", "Character 2")
  const lim3Ref = doc(db, "characters", "Character 3")

  useEffect(()=>{
    const getLimits = async ()=>{
      const lim1 = await getDoc(lim1Ref)
      setLimit1((limit1)=>[lim1._document.data.value.mapValue.fields.minX["integerValue"],lim1._document.data.value.mapValue.fields.maxX["integerValue"],lim1._document.data.value.mapValue.fields.minY["integerValue"],lim1._document.data.value.mapValue.fields.maxY["integerValue"]])
      const lim2 = await getDoc(lim2Ref)
      setLimit2((limit2)=>[lim2._document.data.value.mapValue.fields.minX["integerValue"],lim2._document.data.value.mapValue.fields.maxX["integerValue"],lim2._document.data.value.mapValue.fields.minY["integerValue"],lim2._document.data.value.mapValue.fields.maxY["integerValue"]])

      const lim3 = await getDoc(lim3Ref)
      setLimit3((limit3)=>[lim3._document.data.value.mapValue.fields.minX["integerValue"],lim3._document.data.value.mapValue.fields.maxX["integerValue"],lim3._document.data.value.mapValue.fields.minY["integerValue"],lim3._document.data.value.mapValue.fields.maxY["integerValue"]])


      console.log(limit1, limit2, limit3)

      
     
    }
    getLimits();
  },[])



  let [seconds, setSeconds] = useState(0)
  let [minutes, setMinutes] = useState(0)
  let [menus, setMenus] = useState([])
  let [endTime, setEndTime] = useState([])
  let [charLeft, setCharLeft] = useState(2)
  let [foundChar, setFoundChar] = useState([])


  
  const ref = React.useRef(null)
  const char1 = React.useRef(null)
  const char2 = React.useRef(null)
  const char3 = React.useRef(null)
  const timerRef = React.useRef(null)
  const winRef = React.useRef(null)
  const clickMenuRef = React.useRef(null)
  const mouse = useRef(ref, {
    enterDelay: 100,
    leaveDelay: 100
  })
  const position = useMouse(document.querySelector('#full-image'))
  const clickMenuStyle = {
    left: `${position.x+45}px`,
    top: `${position.y+25}px`
  }
  const boxMenuStyle ={
    left: `${position.x-40}px`,
    top: `${position.y+30}px`,
    backgroundColor: 'transparent'
  }


  useEffect(()=>{
  let myInterval = setInterval(() => {
    setSeconds((seconds)=>seconds+1)
    if(seconds===59){
      setMinutes((minutes)=>minutes+1)
      setSeconds(0)
    }
  }, 1000);
  return ()=>{
    clearInterval(myInterval)
  }
})

const checkAns=(ch,char)=>{
  if(ch==="ch1"&&(position.x>limit1[0]&&position.x<limit1[1])&&(position.y>limit1[2]&&position.y<limit1[3])){
    char.current.style.backgroundColor = 'green';
    setTimeout(()=>{char.current.style.cssText = 'pointer-events: none; backgroundColor:rgb(47,47,47)'},150)
    setTimeout(()=>{clickMenuRef.current.style.cssText = 'none';},100)
    setCharLeft((charLeft)=>charLeft-1)
    setFoundChar((foundChar)=>[...foundChar,ch])
    checkWin(charLeft)


  }else if(ch==="ch2"&&(position.x>limit2[0]&&position.x<limit2[1])&&(position.y>limit2[2]&&position.y<limit2[3])){
    char.current.style.backgroundColor = 'green';
    setTimeout(()=>{char.current.style.cssText = 'pointer-events: none; backgroundColor:rgb(47,47,47)'},150)
    setTimeout(()=>{clickMenuRef.current.style.display = 'none';},100)
    setCharLeft((charLeft)=>charLeft-1)
    setFoundChar((foundChar)=>[...foundChar,ch])
    checkWin(charLeft)



  }else if(ch==="ch3"&&(position.x>limit3[0]&&position.x<limit3[1])&&(position.y>limit3[2]&&position.y<limit3[3])){
    console.log("Correct")
    char.current.style.backgroundColor = 'green';
    setTimeout(()=>{char.current.style.cssText = 'pointer-events: none; backgroundColor:rgb(47,47,47)'},150)
    setTimeout(()=>{clickMenuRef.current.style.display = 'none';},100)
    setCharLeft((charLeft)=>charLeft-1)
    setFoundChar((foundChar)=>[...foundChar,ch])
    checkWin(charLeft)


  }else {
    char.current.style.backgroundColor = 'red'
    setTimeout(()=>{clickMenuRef.current.style.display = 'none';},100)
  }
  setTimeout(()=>char.current.style.backgroundColor = 'rgb(47,47,47)',200)
}


const checkWin = (charLeft) =>{
  if(charLeft===0){
    console.log('you won')
    setEndTime([minutes,seconds])
    timerRef.current.style.display= 'none';
    winRef.current.style.display = "flex";
    ref.current.style.display ="none";
    window.scrollTo(0,0)
    setTimeout(()=>{clickMenuRef.current.style.display = 'none';},100)

  }
}
const handleClick = (e) =>{
  
  console.log(position.x,position.y)
  setMenus([
    <div className='selecMenu' ref={clickMenuRef}>
      <div className='selection-box' style={boxMenuStyle}></div>
      <div id='clickMenu' style={clickMenuStyle}>
        <div ref={char1} className='menu-option' id="ch1" onClick={()=>checkAns('ch1',char1)}>Character 1</div>
        <div ref={char2} className='menu-option' id="ch2" onClick={()=>checkAns('ch2',char2)}>Character 2</div>
        <div ref={char3} className='menu-option' id="ch3" onClick={()=>checkAns('ch3',char3)}>Character 3</div>
      </div>
    </div>
  ])
  clickMenuRef.current.style.display = 'inline';
}



  return (
    <div>
    <div ref={winRef} id='win-screen'>
      <h1>You WON!</h1>
      <h1>It took you {endTime[0]} minutes and {endTime[1]} seconds to complete the game!</h1>
    </div>
    <div className="App">
      <div className='menu'>
        <div ref={timerRef} className='timer'>
          {minutes}:{seconds}
        </div>
        <div className="buttons">

        </div>
        <Characters foundChar={foundChar}/>

      </div>
      <img src='Full.jpg' alt='background' id='full-image' ref={ref} onClick={handleClick}></img>
      {menus}
    </div>
    </div>
  );
}

export default App;
