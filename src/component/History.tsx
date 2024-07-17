
import './../css/history.css'
import { useNavigate } from "react-router-dom";
import { LoadingBar, LoadingDot } from './Nav';
import { useEffect, useState } from "react";
import moment from 'moment';

let position: string[] = ['내야수', '외야수', '포수', '투수'];

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

// interface My_info {
//     nickname: string,
//     regist_mement: string,
//     team: {
//         team1: string | null,
//         team2: string | null,
//     },
//     username: string,
//     _id: string,
// }

interface Applyguest {
    age: number[],
    approval: boolean | undefined, // 수락된 유저.
    approval_position: boolean[] | undefined, // 수락된 유저.
    application_date: string | undefined, // 수락 및 거절된 유저는 없음
    confirm: boolean,
    date: string,
    end: boolean,
    level: string,
    nickname: string,
    position: boolean[],
    post_id: string,
    sex: string,
    stadium: string,
    submit_position: boolean[],
    user_id: string,
    withdrawal: boolean, // 거절된 유저
    withdrawal_reason: number | undefined, // 거절된 유저
    _id: string,
    join_data: string | undefined // 거절유저
}

interface Postdata_guest {
    age: number[],
    content: string,
    date: string,
    level: string,
    no: number,
    position: boolean[],
    recruitment: number[],
    recruitment_fix: number[],
    sex: string,
    stadium: string,
    time: string,
    write_time: string,
    writer_id: string,
    _id: string,
    end: boolean
}

interface Postdata_guest_props {
    guestPost: Postdata_guest | undefined
}

interface Postdata_bulletin {
    _id: string,
    no: number,
    classification: 1 | 2 | 3,
    title: string,
    content: string,
    writer_id: string,
    writer_nickname: string,
    write_time: string,
    view: number,
    like: number,
    comment: number
}

interface Postdata_bulletin_props {
    bulletinPost: Postdata_bulletin | undefined
}

function Applicationhistory() {
    const [loading, setLoading] = useState<boolean>(false)
    const [originApplyGuest, setOriginApplyGuest] = useState<Applyguest[]>()
    const [applyGuest, setApplyGuest] = useState<Applyguest[]>()

    useEffect(() => {
        fetch('/api/mypage/history/application', {
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
                await setOriginApplyGuest(res.apply_guest)
                await setLoading(true)
                return;
            } else {
                console.log(res)
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    useEffect(() => {
        applyGuest_sort()
    }, [loading])

    function applyGuest_sort() {
        if (typeof (originApplyGuest) === "undefined") return
        var time_sort = originApplyGuest?.sort((a, b) => {
            return moment(b.application_date).isBefore(a.application_date) ? -1 : 1;
        })
        return setApplyGuest(time_sort)
    }

    return (
        <div className="History-Wrap">
            <div className='applicationhistory'>
                <div className='history-title'>
                    <h5>호스트</h5>
                </div>
                <div className='history-body'>
                    <div className='history-th'>
                        {/* <div className='history-td td-1'>
                            <h6>구분</h6>
                        </div> */}
                        <div className='history-td td-2'>
                            <h6>모집정보</h6>
                        </div>
                        <div className='history-td td-3'>
                            <h6>신청일시</h6>
                        </div>
                        <div className='history-td td-4'>
                            <h6>진행상황</h6>
                        </div>
                        <div className='history-td td-5'>
                            <p> - </p>
                        </div>
                    </div>
                    {!loading && (<><LoadingBar /><LoadingDot /></>)}
                    {loading && (<>
                        {applyGuest && applyGuest?.length > 0 ? <>
                            {applyGuest?.map((val, idx) => {
                                const oddidx = idx % 2 === 0;
                                const progressApply = !val.confirm ? "신청중" : val.approval ? "신청수락" : "신청거절"
                                const progressColor = !val.confirm ? "gray" : val.approval ? "blue" : "red"
                                const positionText = val.submit_position?.map((val, idx) => val ? `${position[idx]} ` : '').filter(val => val)
                                return (
                                    <div className='history-tr'
                                        key={idx}
                                        style={{ background: oddidx ? "" : "" }}
                                    >
                                        {/* <div className='history-td td-1'>
                                        <div></div>
                                    </div> */}
                                        <div className='history-td td-2'>
                                            <div><p>{val.date}</p></div>
                                            <div><p>{val.stadium}</p></div>
                                            <div><p>{val.level}</p></div>
                                            <div><p>{val.sex}</p></div>
                                            <div><p>[ {positionText}]</p></div>
                                        </div>
                                        <div className='history-td td-3'>
                                            <p>{val.application_date}</p>
                                        </div>
                                        <div className='history-td td-4'>
                                            <div style={{ color: progressColor }}>{progressApply}</div>
                                        </div>
                                        <div className='history-td td-5'>
                                            {/* <p>{cancelText} </p> */}
                                        </div>
                                    </div>
                                )
                            })}
                        </> : <>
                            <HistoryEmpty historyType={['호스트 신청 기록이 없습니다.', '호스트 신청을 해보세요!']} />
                        </>}
                    </>)}
                </div>
            </div>

        </div>
    )
}

function Notifyhistory() {
    const [loading, setLoading] = useState<boolean>(false)
    // const [my_info, setMy_info] = useState<My_info | undefined>()
    const [mynotificationUser_info, setMynotificationUser_info] = useState<MynotificationUser_info[] | undefined>()
    const [mynotificationPost_info, setMynotificationPost_info] = useState<MynotificationPost_info[] | undefined>()
    const [mynotificationTotal_info, setMynotificationTotal_info] = useState<(MynotificationUser_info | MynotificationPost_info)[] | undefined>()

    useEffect(() => {
        fetch('/api/mypage/history/notify', {
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
                // await setMy_info(res.my_info)
                return await setLoading(true)
            } else {
                console.log(res)
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    useEffect(() => {
        notification_sort()
    }, [loading])

    useEffect(() => {
        return () => {
            notify_confirmCheck();
        }
    }, [])

    async function notification_sort() {
        if (!mynotificationPost_info || !mynotificationUser_info) return
        const notificationTotal = await [...mynotificationUser_info, ...mynotificationPost_info]
        const timeSort = await notificationTotal.sort((a, b) => {
            return moment(a.Notification_date).isBefore(b.Notification_date) ? 1 : -1
        })
        await setMynotificationTotal_info(timeSort)
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

    function notify_confirmCheck() {
        fetch('/api/mypage/history/notify/confirm', {
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
            return
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    };

    function notify_delete() {
        setLoading(false)
        fetch('/api/mypage/history/notify/delete', {
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
                await setMynotificationUser_info([])
                await setMynotificationPost_info([])
                await setTimeout(() => {
                    return setLoading(true)
                }, 500)
            } else {
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    };


    return (
        <div className="History-Wrap">
            <div className='notify'>
                <div className='notify-head'>
                    <h5>알림</h5>
                    <p onClick={() => { notify_delete() }}
                        className='pointer'
                    >전체삭제</p>
                </div>
                {!loading && (<><LoadingBar /><LoadingDot /></>)}
                {loading && (<>
                    <div className='notify-body'>
                        {mynotificationTotal_info && mynotificationTotal_info?.length > 0 ? <>
                            {mynotificationTotal_info?.map((val, idx) => {
                                const confirmCheck = val.confirm
                                return (
                                    <div
                                        key={idx}
                                        className={confirmCheck ? 'notify-section confirm' : 'notify-section'}
                                    >
                                        <div className='notify-section-content'>
                                            <p> {val.note[1]}</p>
                                        </div>
                                        <div className='notify-section-time'>
                                            <p> {timeText(val.Notification_date)}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </> : <>
                            <HistoryEmpty historyType={['알림 기록이 없습니다.', '알림 기록이 없습니다!']} />
                        </>}
                    </div>
                </>)}
            </div>
        </div>
    )
}

function Writehistory() {

    const [loading, setLoading] = useState<boolean>(false)
    const [guestPostData, setGuestPostData] = useState<Postdata_guest[]>()
    const [bulletinPostData, setBulletinPostData] = useState<Postdata_bulletin[]>()

    useEffect(() => {
        fetch('/api/mypage/history/write', {
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
                await setBulletinPostData(res.bulletin_post)
                await setGuestPostData(res.guest_post)
                await setLoading(true)
                return;
            } else {
                console.log(res)
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })


    }, [])

    return (
        <div className='History-Wrap'>
            {!loading && (<LoadingBar />)}
            <div className='pd20'>
                <div className='historyhost'>
                    <div className='history-title'>
                        <h5>작성 내역 (호스트 모집)</h5>
                    </div>
                    <div className='history-body'>
                        <div className='history-th'>
                            <div className='history-td td-1'>
                                <h6>모집정보</h6>
                            </div>
                            <div className='history-td td-2'>
                                <h6>게시일자</h6>
                            </div>
                            <div className='history-td td-3'>
                                <h6>현재상태</h6>
                            </div>
                            <div className='history-td td-4'>
                                <h6> - </h6>
                            </div>
                        </div>
                        {!loading && (<LoadingDot />)}
                        {loading && (<>
                            {guestPostData && guestPostData?.length > 0 ? <>
                                {guestPostData?.map((val, idx) =>
                                    <Historyhost guestPost={val} key={idx}></Historyhost>
                                )}
                            </> : <>
                                <HistoryEmpty historyType={['호스트 모집 작성 기록이 없습니다.', '호스트를 모집 해보세요!']} />
                            </>}
                        </>)}
                    </div>
                </div>
                <div className='historyreview'>
                    <div className='history-title'>
                        <h5>작성 내역 </h5>
                    </div>
                    <div className='history-body'>
                        <div className='history-th'>
                            <div className='history-td td-1'>
                                <h6>제목</h6>
                            </div>
                            <div className='history-td td-2'>
                                <h6>게시일자</h6>
                            </div>
                            <div className='history-td td-3'>
                                <h6>-</h6>
                            </div>
                        </div>
                        {!loading && (<LoadingDot />)}
                        {loading && (<>
                            {bulletinPostData && bulletinPostData?.length > 0 ? <>
                                {bulletinPostData?.map((val, idx) =>
                                    <Historyreview bulletinPost={val} key={idx}></Historyreview>
                                )}
                            </> : <>
                                <HistoryEmpty historyType={['게시판 작성 기록이 없습니다.', '게시판에 글을 남겨보세요!']} />
                            </>}
                        </>)}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Historyhost(props: Postdata_guest_props) {
    const navigate = useNavigate();
    const { guestPost } = props;
    const positionText = guestPost?.position?.map((val, idx) => val ? `${position[idx]} ` : '').filter(val => val)

    return (
        <div className='history-tr' onClick={() => {
            navigate(`/guestpost/${guestPost?._id}`)
        }}>
            <div className='history-td td-1'>
                <div><p>{guestPost?.date}</p></div>
                <div><p>{guestPost?.stadium}</p></div>
                <div><p>{guestPost?.level}</p></div>
                <div><p>{guestPost?.sex}</p></div>
                <div><p>[ {positionText}]</p></div>
            </div>
            <div className='history-td td-2'>
                <p>{guestPost?.write_time}</p>
            </div>
            <div className='history-td td-3'>
                <div>{guestPost?.end ? "모집종료" : "모집중"}</div>
            </div>
            <div className='history-td td-4'>
                <p>-</p>
            </div>
        </div>
    )
}

function Historyreview(props: Postdata_bulletin_props) {

    const navigate = useNavigate();
    const { bulletinPost } = props;
    const writer_time = moment(bulletinPost?.write_time).format('YYYY-MM-DD')
    return (
        <div className='history-tr'
            onClick={() => navigate('/bulletinpost/' + bulletinPost?._id)}
        >
            <div className='history-td td-1'>
                <p>{bulletinPost?.title}</p>
            </div>
            <div className='history-td td-2'>
                <p>{writer_time}</p>
            </div>
            <div className='history-td td-3'>
                <p>이동</p>
            </div>
        </div>
    )
}

function HistoryEmpty(props: { historyType: string[] }) {
    const { historyType } = props;
    return (
        <div className='Historyempty-Wrap'>
            <div className='historyempty-box'>
                <h6>{historyType[0]}</h6>
                <p>{historyType[1]}</p>
            </div>
        </div>
    )
}



export { Applicationhistory, Writehistory, Notifyhistory }