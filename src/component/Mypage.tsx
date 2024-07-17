import { useEffect, useState } from 'react'
import './../css/mypage.css'
import { useNavigate } from 'react-router-dom'
import { CalendarMypage } from './Calender'
import { LoadingBar, LoadingDot } from './Nav';
import moment from 'moment'
require('moment/locale/ko');


interface My_info {
    nickname: string,
    regist_mement: string,
    team: {
        team1: string | null,
        team2: string | null,
    },
    username: string,
    _id: string,
}

interface Myteam_info {
    team_name: string,
    team_url: string,
    team_id: string,
    team_myrating: number
}

interface MynotificationUser_info {
    _id: string,
    recevie_id: string,
    send_id: string,
    major_category: number,
    sub_category: number,
    note: string[],
    Notification_date: string,
    confirm: boolean
}

interface MynotificationPost_info {
    _id: string,
    recevie_id: string,
    recevie_userid: string,
    send_id: string,
    major_category: number,
    sub_category: number,
    note: string[],
    Notification_date: string,
    confirm: boolean
}


function Mypage() {
    let navigate = useNavigate()

    const [loading, setLoading] = useState<boolean>(false)
    const [my_info, setMy_info] = useState<My_info | undefined>()
    const [myteam_info, setMyteam_info] = useState<(Myteam_info | undefined)[]>()
    const [mynotificationUser_info, setMynotificationUser_info] = useState<MynotificationUser_info[] | undefined>()
    const [mynotificationPost_info, setMynotificationPost_info] = useState<MynotificationPost_info[] | undefined>()
    const [mynotificationMini_info, setMynotificationMini_info] = useState<(MynotificationUser_info | MynotificationPost_info)[] | undefined>()
    // const [mynotificationTotal_info, setMynotificationTotal_info] = useState<(MynotificationUser_info | MynotificationPost_info)[] | undefined>()


    useEffect(() => {
        fetch('/api/mypage/mypage_data', {
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
                await setMynotificationUser_info(res.mynotification_user)
                await setMynotificationPost_info(res.mynotification_post)
                await setMy_info(res.my_info)
                await setMyteam_info(res.myteam_info)
                return await setLoading(true)
            } else {
                return navigate('/login')
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    useEffect(() => {
        notification_sort()
    }, [loading])

    async function notification_sort() {
        if (!mynotificationPost_info || !mynotificationUser_info) return
        const notificationTotal = await [...mynotificationUser_info, ...mynotificationPost_info]
        const timeSort = await notificationTotal.sort((a, b) => {
            return moment(a.Notification_date).isBefore(b.Notification_date) ? 1 : -1
        })
        // await setMynotificationTotal_info(timeSort)
        await setMynotificationMini_info(timeSort.slice(0, 5))
        return
    }

    function timeText(date: string) {
        const now = moment()
        const targetDate = moment(date)
        const diffSeconds = now.diff(targetDate, 'seconds');
        const diffMinutes = now.diff(targetDate, 'minutes');
        const diffHours = now.diff(targetDate, 'hours');
        const diffDays = now.diff(targetDate, 'days');
        if (diffSeconds <= 60) {
            return `${diffSeconds}초 전`;
        } else if (diffMinutes <= 60) {
            return `${diffMinutes}분 전`;
        } else if (diffHours <= 24) {
            return `${diffHours}시간 전`;
        } else {
            return `${diffDays}일 전`;
        }
    };

    return (
        <div className='Mypage-Wrap Post-wrap'>
            {!loading && (<><LoadingBar /><LoadingDot /></>)}
            {loading && (<>
                <div className='mypage-photo post-photo'>

                </div>
                <div className='mypage-content post-content'>
                    <div className='mypage-content-l post-content-l'>
                        <div className='mypage-content-section'>
                            <div className='mypage-content-myinfo'>
                                <div>
                                    <h5>{my_info?.nickname}</h5>
                                </div>
                                <div>
                                    <p onClick={() => {
                                        fetch('/api/logout', {
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
                                                await navigate('/board')
                                                return;
                                            } else {
                                                return console.log(res)
                                            }
                                        }).catch((err) => {
                                            console.error(`오류코드 ${err.status} = ` + err);
                                        })

                                    }}>로그아웃</p>
                                </div>
                            </div>
                        </div>
                        <div className='mypage-content-section'>
                            <div className='mypage-content-notification'>
                                <div className='notification-title'>
                                    <h5>최근 알림</h5>
                                    <p
                                        onClick={() => { navigate('notify') }}
                                        className='pointer'
                                    >더보기</p>
                                </div>
                                <div className='notification-body'>
                                    {mynotificationMini_info?.length === 0 ?
                                        <>
                                            <div className='notification-content'>
                                                <div style={{ justifyContent: 'flex-start' }}>
                                                    <p>최근 알림이 없습니다.</p>
                                                </div>
                                            </div>
                                        </>
                                        :
                                        <>
                                            {mynotificationMini_info?.map((val, idx) => {
                                                return (
                                                    <div
                                                        className='notification-content'
                                                        key={idx}>
                                                        <div>
                                                            <p>{val.note[0]}</p>
                                                        </div>
                                                        <div>
                                                            <p>{timeText(val.Notification_date)}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='mypage-content-section'>
                            <div className='mypage-content-calender'>
                                <div className='calender-title'>
                                    <h5>나의 일정</h5>
                                    <div className='blue' />
                                    <div className='green' />
                                    <div className='red' />
                                </div>
                                <div className='calender-body'>
                                    <CalendarMypage />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mypage-content-r post-content-r'>
                        <div className='mypage-content-section'>
                            <div className='mypage-content-menu'>
                                <div className='menu-title'>
                                    <h5>⚾ My Team</h5>
                                </div>
                                {myteam_info?.length === 0 && (
                                    <div className='menu-bar pointer'>
                                        <div className='menu-bar-name'>
                                            <h5>현재 소속된 팀이 없습니다.</h5>
                                        </div>
                                        <div className='menu-bar-button'>
                                        </div>
                                    </div>
                                )}
                                {myteam_info?.map((val, idx) => {
                                    return (
                                        <div key={idx}
                                            className='menu-bar pointer'
                                            onClick={() => { navigate(`/teampost/${val?.team_url}`) }}
                                        >
                                            {/* <div className='menu-bar-logo'>
                                            <p>Logo</p>
                                            <p>Space</p>
                                        </div> */}
                                            <div className='menu-bar-name'>
                                                <h5>{val?.team_name}</h5>
                                            </div>
                                            <div className='menu-bar-button'>
                                                <p>바로가기</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className='mypage-content-menu'>
                                <div className='menu-title'>
                                    <h5>⚾ My History</h5>
                                </div>
                                <div className='menu-bar'>
                                    <div className='menu-bar-name pointer' onClick={() => { navigate("/mypage/apply") }}>
                                        <h5>신청내역 ( 호스트 )</h5>
                                    </div>
                                </div>
                                <div className='menu-bar'>
                                    <div className='menu-bar-name pointer' onClick={() => { navigate("/mypage/write") }}>
                                        <h5>작성내역 ( 호스트모집 / 후기 )</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>)
            }
        </div >
    )
}




export default Mypage