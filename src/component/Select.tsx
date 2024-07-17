import { useEffect, useState } from 'react'
import './../css/select.css'
import { Outlet, useNavigate, useLocation } from 'react-router-dom';


function Select() {
    const navigate = useNavigate()
    const location = useLocation();
    const { pathname } = location;
    const [path, setPath] = useState<string>("")
    const [pathNum, setPathNum] = useState<number>(0)
    const possiblePath: string[] = ['guest', 'team', 'bulletin']
    const select_title: string[] = ['게스트 모집', '팀원 모집', '게시판']
    const select_content: string[] = ['게스트를 모집해보세요.', '팀원을 모집해보세요.', '자유,후기,질문등 자유롭게 글을 써보세요.']
    useEffect(() => {
        async function checkPath() {
            try {
                var lastIndex = await pathname.lastIndexOf('/')
                var currentPath = await pathname.substring(lastIndex + 1)
                var currentPathNum = await possiblePath.findIndex((val) => val === currentPath)
                await setPathNum(currentPathNum)
                if (possiblePath.includes(currentPath)) {
                    await setPath(currentPath)
                    return
                } else {
                    await navigate('/board/guest')
                    return
                }
            } catch (err) {
                console.log(err)
            }
        }
        checkPath()
    }, [location])

    function reset() {
        fetch('/api/reset', {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else if (!res.ok) {
                return res.json().then((err) => {
                    const error = new Error(err.message);
                    err.status = res.status;
                    throw error
                })
            }
        }).then(async (res) => {
            if (res.success) {
                return
            } else {
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    return (
        <div className="select-Wrap component-Wrap">
            <div className='select-main'>
                <div className='select-title'>
                    <h6 onClick={() => { reset() }}>
                        {`${select_title[pathNum]}`}
                    </h6>
                </div>
                <div className='select-content'>
                    <p>
                        {`${select_content[pathNum]}`}
                    </p>
                </div>
            </div>
            <div className='select-tab'>
                <div className={path === possiblePath[0] ? 'pointer selected' : 'pointer'}
                    onClick={() => navigate(`/board/${possiblePath[0]}`)}
                >
                    <p>게스트</p>
                </div>
                <div className={path === possiblePath[1] ? 'pointer selected' : 'pointer'}
                    onClick={() => navigate(`/board/${possiblePath[1]}`)}
                >
                    <p>팀원</p>
                </div>
                <div className={path === possiblePath[2] ? 'pointer selected' : 'pointer'}
                    onClick={() => navigate(`/board/${possiblePath[2]}`)}
                >
                    <p>게시판</p>
                </div>
            </div>
            <div className='select-section'>
                <Outlet></Outlet>
            </div>
        </div>
    )
}



export default Select