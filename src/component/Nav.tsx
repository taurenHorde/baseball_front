import './../css/nav.css'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react';

function Nav() {
    const location = useLocation();
    const [checklogin, setChecklogin] = useState<boolean>(false)

    useEffect(() => {
        fetch('/api/check_login', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            if (res.ok) {
                return res.json()
            } else {
                return res.json().then((err) => {
                    const error = new Error(err.message);
                    err.status = res.status;
                    throw error
                })
            }
        }).then(async (res) => {
            if (res.success) {
                return await setChecklogin(true)
            } else {
                return await setChecklogin(false)
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })

    }, [location])

    return (
        <div className="nav-Wrap component-Wrap">
            <div className='nav-part-R nav-part'>
                <div className='nav-logo'>
                    ⚾
                </div>
            </div>
            <div className='nav-part-L nav-part'>
                <div className='nav-alarm'>
                    <p><Link to="/board" className='Link'>게시판</Link></p>
                </div>
                <div className='nav-menu'>
                    {checklogin ?
                        <p><Link to="/mypage" className='Link'>내 정보</Link></p>
                        :
                        <p><Link to="/login" className='Link'>로그인</Link></p>
                    }
                </div>
            </div>
        </div>
    )
}

function LoadingBar() {
    return (
        <div className='Loading-bar-wrap'>
            <div className='loading-bar'></div>
        </div>
    )
}

function LoadingDot() {
    return (
        <div className='Loading-dot-wrap'>
            <div className='loading-dot'>
                <div /><div /><div />
            </div>
        </div>
    )
}

function UrlEmpty() {
    return (
        <div className='Url_empty-Wrap'>
            <div className='url_empty-box'>
                <h5>404</h5>
                <h6>잘못된 접근입니다.</h6>
                <p>상단 메뉴바를 통해 이동해주시길 바랍니다.</p>
            </div>
        </div>
    )
}

export { Nav, LoadingBar, LoadingDot, UrlEmpty }