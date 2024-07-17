import './css/main.css';
import 'react-calendar/dist/Calendar.css'; //css import
import { Routes, Route, Navigate } from 'react-router-dom'
import { Nav, UrlEmpty } from './component/Nav';
import Select from './component/Select';
import { Guestpost, Teampost, Bulletinpost } from './component/Post';
import { Login, Regist } from './component/Login';
import Mypage from './component/Mypage';
import { Teampostadmin, Teampostadminsetting, Teampostadminmember } from './component/Team_admin';
import { Applicationhistory, Writehistory, Notifyhistory } from './component/History';
import { Guestwrite, Bulletinwrite } from './component/Write';
import { FindGuest, FindTeammate, Bulletin } from './component/Board';
import Guestpostadmin from './component/Guest_admin';


// main compoonent
function App() {
  return (
    <div className="App">
      <div className='main-Wrap'>

        <Nav></Nav>
        <Routes>
          <Route path="/" element={<Mainpage />} />

          <Route path="board/*" element={<Select />}>
            <Route index element={<Navigate to='guest' />} />
            <Route path='guest' element={<FindGuest />} />
            <Route path='team' element={<FindTeammate />} />
            <Route path='bulletin' element={<Bulletin />} />
          </Route>
          <Route path="guestpost/:id" element={<Guestpost />} />
          <Route path="guestpost/:id/admin" element={<Guestpostadmin />} />

          <Route path="teampost/:id" element={<Teampost />} />
          <Route path="teampost/:id/admin" element={<Teampostadmin />} />
          <Route path="teampost/:id/admin/setting" element={<Teampostadminsetting />} />
          <Route path="teampost/:id/admin/member" element={<Teampostadminmember />} />
          <Route path="bulletinpost/:id" element={<Bulletinpost />} />

          <Route path="write/guest" element={<Guestwrite />} />
          <Route path="write/bulletin" element={<Bulletinwrite />} />

          <Route path="login" element={<Login />} />
          <Route path="regist" element={<Regist />} />

          <Route path="mypage" element={<Mypage />} />
          <Route path="mypage/apply" element={<Applicationhistory />} />
          <Route path="mypage/write" element={<Writehistory />} />
          <Route path="mypage/notify" element={<Notifyhistory />} />

          <Route path="*" element={<UrlEmpty />} />
        </Routes>

      </div>
      <div className='main-footer' />
    </div >
  )
}


function Mainpage() {
  return (
    <div className='Mainpage-wrap'>
      <div className='mainpage-title'>
        <h5>Baseball Team</h5>
      </div>
      <div className='mainpage-content'>
        <p>팀을 만들어 팀원을 구해보세요!</p>
        <p>급하게 용병(게스트)가 필요한 경우 게스트를 모집해보세요!</p>
        <p>야구 관련 의견을 자유롭게 나눠보세요!</p>
      </div>
    </div>
  )
}


export default App;
