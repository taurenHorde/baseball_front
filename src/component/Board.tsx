import './../css/board.css'
import { useNavigate } from 'react-router-dom'
import Modalteam from './Modal_team'
import { useEffect, useState } from 'react'
import { LoadingBar, LoadingDot } from './Nav'
import { CalendarBoard } from './Calender'
import moment from 'moment'
require('moment/locale/ko');



function FindGuest() {
    let navigate = useNavigate()

    const [originalPostData, setOriginalPostData] = useState<Postdata_guest[] | undefined>();
    const [postdata, setPostdata] = useState<Postdata_guest[] | undefined>();
    const [loading, setLoading] = useState<boolean>(false)
    const [optionModal, setOptionModal] = useState<number | boolean>(false)
    // false - 모달 off / 0 - 위치 / 1- 포지션 / 2- 레벨
    const [optionBox, setOptionBox] = useState<(number | false)[]>([false, false, false])
    // idx 순서대로 위치 포지션 레벨 / false 는 옵션 꺼진상태~
    const [optionClick, setOptionClick] = useState<boolean>(true);
    // 옵션 클릭 및 취소 시 작동 확인 
    const [filterDate, setFilterDate] = useState<string>("");

    useEffect(() => {
        fetch('/api/board/guest_board', {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
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
                await setOriginalPostData(res.post_data)
                await setLoading(true)
                return;
            }
            return;
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    useEffect(() => {
        setPostdata(originalPostData)
    }, [originalPostData])

    useEffect(() => {
        calendar_props(filterDate)
    }, [optionClick])

    async function calendar_props(select: string) {
        await setFilterDate(select)
        const filterActivationCheck = await optionBox.some((val) => typeof (val) === 'number')
        if (!originalPostData) {
            return await setPostdata(originalPostData);
        }
        var copy: Postdata_guest[] = await [];
        if (select) {
            for (var i = 0; i < originalPostData.length; i++) {
                if (moment(originalPostData[i].date).isSame(moment(select), 'day')) {
                    await copy.push(originalPostData[i])
                }
            }
        } else {
            copy = await [...originalPostData]
        }
        if (filterActivationCheck) {
            await guest_filter(copy)
            return
        } else {
            await setPostdata(copy)
            return
        }
    }

    async function guest_filter(beforeData: Postdata_guest[] | undefined) {
        if (!originalPostData) return
        var copy;
        if (beforeData === undefined) {
            copy = await [...originalPostData]
        } else {
            copy = await [...beforeData]
        }
        var applyFilterData: Postdata_guest[] = await []
        // 이 아래는 게스트 모집 필터 적용 반복문 in 반복문
        for (var i = 0; i < copy.length; i++) { // 날짜 반복문이 끝난 데이터 반복문 선언
            var filter: boolean = await true; // 기본갑은 true 이나 필터에 하나라도 안맞으면 false로 변경 될 예정 추후 false은 다 드랍
            for (var j = 0; j < optionBox.length; j++) { // 필터 반복문 시작 optionbox idx 순서대로 - 위치 포지션 레벨
                const optionActivecheck = await optionBox[j] // 옵션박스를 optioncheck 변수에 할당 
                if (typeof (optionActivecheck) === 'number' && copy[i] !== undefined) {
                    // optioncheck가 false 이면 필터 비 활성화, number 면 활성화 (숫자에 따라 필터 적용 다름) 
                    // copy가 없으면 돌아갈 수 없으니 undifined 체크 함 해주는거 
                    if (j !== 1) {
                        // j가 0,2가 위치 레벨, 저장 자체가 숫자로 필터가 정해지기 때문에 그냥 진행
                        if (copy[i][optionstring[j]] !== optionarray[j][optionActivecheck]) {
                            filter = await false
                            break;
                        }
                        // copy 내 데이터가 필터와 같은지 확인
                    } else if (j === 1) {
                        // j가 1이면 포지션, 포지션은 모집자가 한 포지션만 구하는게 아니기에 저장이 배열내 boolean으로 되어있음
                        // 그래서 번호에 맞게 추출해서 true인지 false인지 확인
                        // const positionidx = await copy[i].position[optioncheck]
                        if (!copy[i].position[optionActivecheck]) {
                            filter = await false
                            break;
                        }
                    }
                }
            }

            if (filter) await applyFilterData.push(copy[i])
        }
        return await setPostdata(applyFilterData)
    }

    async function write_post() {
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
                await navigate('/write/guest')
                return;
            } else {
                await navigate('/login')
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    function optionmodal_content(): JSX.Element {
        if (typeof (optionModal) !== 'number') return (<></>);
        return (
            <>
                <div className='optionmodal-head'>
                    <h5>게스트 모집 옵션 : {optiontype[optionModal]}</h5>
                </div>
                <div className='optionmodal-body'>
                    {optionarray[optionModal].map((val, idx) => {
                        const optioncheck = (optionBox[optionModal] === idx);
                        return (
                            <div
                                className={optioncheck ? 'option select' : 'option'}
                                key={idx}
                                onClick={() => {
                                    setOptionBox((pre) => {
                                        pre[optionModal] = idx
                                        return pre
                                    })
                                    setOptionModal(false)
                                    setOptionClick(!optionClick)
                                }}>
                                <p>{val}</p>
                            </div>
                        )
                    })}
                    <div className='option'
                        onClick={() => {
                            setOptionBox((pre) => {
                                pre[optionModal] = false
                                return pre
                            })
                            setOptionModal(false)
                            setOptionClick(!optionClick)
                        }}
                        style={{ marginTop: '20px' }}
                    >
                        <p>{optiontype[optionModal]} 옵션 제거 및 나가기</p>
                    </div>
                </div>
                <div className='optionmodal-button'>

                </div>
            </>
        )
    }

    return (
        <div className="findguest-Wrap">
            <div className='findguest-calender'>
                <CalendarBoard calendarFuc={calendar_props} />
            </div>
            <div className='findguest-option'>
                {optiontype.map((val, idx) => {
                    const optionidx = optionBox[idx]
                    const checkidx = typeof (optionidx) === 'number'
                    var optiontext;
                    if (checkidx) {
                        optiontext = `${optionarray[idx][optionidx]}`
                    }
                    return <div
                        className={checkidx ? 'option select' : 'option'}
                        key={idx}
                        onClick={() => setOptionModal(idx)}>
                        <p>{optiontext ?? val}</p>
                    </div>
                })}
            </div>
            {!loading && (<><LoadingBar /><LoadingDot /></>)}
            {loading && (<>
                <div className='findguest-section'>
                    {postdata !== undefined && postdata?.length > 0 ? <>
                        {postdata?.map((val, idx) => {
                            return (
                                <Guestnotice postdata={val} key={idx} />
                            )
                        })}
                    </> : <>
                        <div className='board-empty'>
                            <h5>게스트 모집 글이 없습니다.</h5>
                            <p>게스트 모집을 통해 선수를 모집해보세요.</p>
                        </div>
                    </>}

                </div>
                <div className='findguest-write pointer'
                    onClick={() => { write_post() }}
                >
                    <p> + 게스트 모집 </p>
                </div>
                {optionModal !== false && (
                    <div className='modal'>
                        <div className='optionmodal-wrap'>
                            {optionmodal_content()}
                        </div>
                    </div>
                )}
            </>)}
        </div>
    )
}

function Guestnotice(props: Postdata_guest_props) {
    const navigate = useNavigate();
    const postdata = props.postdata;
    const postPosition = ['내야수', '외야수', '포수', '투수'].map((val, idx) => postdata?.position[idx] ? val : undefined).filter(position => position)
    const postPositionText = postPosition.join('ㆍ')
    const postTimeText = `${moment(postdata?.date).locale('ko').format('M월 D일 dddd')} ${postdata?.time}`;
    const postAgeText = postdata?.age[0] === postdata?.age[1] ? `${postdata?.age[0]} 대` : `${postdata?.age[0]}-${postdata?.age[1]}대`

    return (
        <div className="guestnotice-Wrap pointer"
            onClick={() => {
                navigate('/guestpost/' + postdata?._id)
            }}
            style={{ background: postdata?.end ? "rgba(248, 188, 188, 0.060)" : "none" }}
        >
            <div className='guestnotice-l'>
                <div className='guestnotice-date'>
                    <h4>{postTimeText}</h4>
                </div>
                <div className='guestnotice-stadium'>
                    <h5>{postdata?.stadium}</h5>
                </div>
                <div className='guestnotice-info'>
                    {/* findteam 처럼 바꿀껀지는 나중에 처리 */}
                    <p> ⚾ 모집포지션 ({postPositionText})ㆍ{postdata?.sex}ㆍ{postdata?.level} 수준ㆍ{postAgeText}</p>
                </div>
            </div>
            <div className='guestnotice-r'>
                {postdata?.end ?
                    <div className='guestnotice-end'
                        style={{ background: 'black', color: 'white' }}
                    >
                        <p>모집종료</p>
                    </div>
                    :
                    <div className='guestnotice-end'
                        style={{ background: 'rgba(0, 0, 139, 0.103)' }}>
                        <p>모집중</p>
                    </div>
                }
            </div>
        </div>
    )
}

function FindTeammate() {
    const navigate = useNavigate();
    const [modalTeam, setModalTeam] = useState<boolean>(false)
    const [postdata, setPostdata] = useState<Postdata_team[] | undefined>();
    const [loading, setLoading] = useState<boolean>(false)

    async function modal_T() {
        fetch('api/check_login', {
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
                await setModalTeam(true)
                return;
            } else {
                await navigate('/login')
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    useEffect(() => {
        fetch('/api/board/team_board', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
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
                await setLoading(true)
                setPostdata(res.post_data)
                return
            } else {
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    return (
        <div className="findteammate-Wrap">
            {!loading && (<><LoadingBar /><LoadingDot /></>)}
            {loading && (<>
                {/* <div className='findteammate-option'>
                    <div className='option'>
                        <p>위치</p>
                    </div>
                    <div className='option'>
                        <p>포지션</p>
                    </div>
                    <div className='option'>
                        <p>레벨</p>
                    </div>
                </div>  */}
                <div className='findteammate-section'>
                    {postdata !== undefined && postdata?.length > 0 ? <>
                        {postdata?.map((val, idx) => {
                            return <Teammatenotice postdata={val} key={idx} />
                        })}
                    </> : <>
                        <div className='board-empty'>
                            <h5>팀원 모집 글이 없습니다.</h5>
                            <p>팀을 만들어 팀원을 모집해보세요.</p>
                        </div>
                    </>}
                </div>
                <div className='findteammate-write pointer'
                    onClick={() => {
                        modal_T()
                    }}>
                    <p> + 팀 만들기 </p>
                </div>
                {modalTeam && (
                    <div className='modal'>
                        <Modalteam></Modalteam>
                    </div>
                )}
            </>)}
        </div>
    )
}

function Teammatenotice(props: Postdata_team_props) {
    const navigate = useNavigate();
    var postDayText: string | null = "";
    var postAgeText: string | null = "";
    const postdata = props.postdata;
    const postDay = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'].map((val, idx) => postdata?.day[idx] ? val : undefined).filter(day => day)
    const postTime = ['06시~10시 : 아침', "10시~18시 :  낮 ", '18시~24시 : 저녁', '24시~06시 : 심야'].map((val, idx) => postdata?.time[idx] ? val : undefined).filter(time => time)
    const postAge = ['10대', '20대', '30대', '40대', '50대이상'].map((val, idx) => postdata?.age[idx] ? val : undefined).filter(age => age)
    const postSex = ['남성', '여성'].map((val, idx) => postdata?.sex[idx] ? val : undefined).filter(age => age)
    const postLevel = ['사회인 4부', '사회인 3부', '사회인 2부', '사회인 1부', '취미 수준'].map((val, idx) => postdata?.level[idx] ? val : undefined).filter(age => age)
    const postAgeFisrtLastText = `${postAge.slice(0, 1)[0]} ~ ${postAge.slice(-1)[0]}`
    const postDayFisrtText = postDay.map((val) => val ? val[0] : "")
    if (postDay) postDayText = postDay?.length > 1 ? `${postDayFisrtText} ` : `${postDay} `
    if (postAge) postAgeText = postAge?.length > 1 ? `${postAgeFisrtLastText} ` : `${postAge} `


    return (
        <div className="teammatenotice-Wrap pointer" onClick={() => {
            navigate('/teampost/' + postdata?.url)
        }}>
            <div className='teamnotice-teammark'>
                <p>Mark'</p>
            </div>
            <div className='teamnotice-l'>
                {/* teamnotice-l-div 는 한줄표현을 위해 사용 */}
                <div className='teamnotice-l-div'>
                    <div className='teamnotice-name'>
                        <h4>{postdata?.name}</h4>
                    </div>
                    <div className='teamnotice-number'>
                        <h6>인원수</h6>
                    </div>
                    <div className='teamnotice-current'>
                        <h6>모집중</h6>
                    </div>
                </div>
                <div className='teamnotice-l-div'>
                    <div className='teamnotice-where'>
                        <p>{postdata?.area ?? "미기입"}</p>
                    </div>
                    <div className="teamnotice-stadium">
                        <p>{postdata?.stadium ?? "미기입"}</p>
                    </div>
                </div>
                <div className='teamnotice-l-div'>
                    <div className="teamnotice-info">
                        <p> ⚾ {postAgeText}ㆍ{postDayText}ㆍ{postTime}ㆍ{postSex}ㆍ{postLevel}</p>
                    </div>
                </div>
                <div className='teamnotice-l-div teamnotice-space'>
                    {/* 한 줄 벌려놓기 용 */}
                </div>
                <div className='teamnotice-l-div'>
                    <div className="teamnotice-info">
                        <p> 👁️‍🗨️조회수 14억 7294만ㆍ📝신청 7억 2012만</p>
                    </div>
                </div>
            </div>
            <div className='teamnotice-r'>
                {/* 나중에 처리결정 */}
            </div>
        </div>
    )
}

function Bulletin() {
    let navigate = useNavigate()

    const [loading, setLoading] = useState<boolean>(false)
    const [originalPostData, setOriginalPostData] = useState<Postdata_bulletin[]>();
    const [postdata, setPostdata] = useState<(Postdata_bulletin | undefined)[]>();
    const [bulletinFilter, setBulletinFilter] = useState<number>(0);

    useEffect(() => {
        fetch('/api/board/bulletin_board', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
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
                await setOriginalPostData(res.post_data)
                return setLoading(true)
            } else {
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    useEffect(() => {
        setPostdata(originalPostData)
    }, [originalPostData])

    async function write_post() {
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
                await navigate('/write/bulletin')
                return;
            } else {
                await navigate('/login')
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    async function bulletin_filter(num: number) {
        if (bulletinFilter === num) {
            await setBulletinFilter(0)
            await setPostdata(originalPostData)
            return
        }
        await setBulletinFilter(num)
        const postData_filter = await originalPostData?.map((val, idx) => {
            if (val.classification === num) return val;
            return undefined;
        }).filter(val => val)
        await setPostdata(postData_filter)
        return
    }

    return (
        <div className='bullein-Wrap'>
            <div className='bullein-option'>
                {['자유', '후기', '질문'].map((val, idx) =>
                    <div
                        className={bulletinFilter === (idx + 1) ? 'option select' : 'option'}
                        key={idx}
                        onClick={() => bulletin_filter((idx + 1))}>
                        <p>{val}</p>
                    </div>
                )}
            </div>
            {!loading && (<><LoadingBar /><LoadingDot /></>)}
            {loading && (<>
                <div className='bullein-section'>
                    {postdata !== undefined && postdata?.length > 0 ? <>
                        {postdata?.map((val, idx) =>
                            <Bulletinnotice key={idx} postdata={val} ></Bulletinnotice>
                        )}
                    </> : <>
                        <div className='board-empty'>
                            <h5>게시판 글이 없습니다.</h5>
                            <p>자유롭게 글을 작성해보세요.</p>
                        </div>
                    </>}
                </div>
                <div className='bullein-write pointer' onClick={() => write_post()}>
                    <p> + 글쓰기 </p>
                </div>
            </>)}
        </div>
    )
}

function Bulletinnotice(props: Postdata_bulletin_props) {
    const navigate = useNavigate();
    const postdata = props.postdata;
    const classificationText = postdata?.classification === 1 ? '자 유' : postdata?.classification === 2 ? "후 기 " : "질 문"
    return (
        <div className="Bulletinnotice-Wrap pointer"
            onClick={() => navigate('/bulletinpost/' + postdata?._id)}
        >
            <div className='bulletinnotice-kind'>
                <p>{classificationText}</p>
            </div>
            <div className='bulletinnotice-l'>
                <div className='bulletinnotice-title'>
                    <h5>{postdata?.title}</h5>
                </div>
                <div className='bulletinnotice-info'>
                    <p>작성자 : {postdata?.writer_nickname}</p>
                    <p>작성일자 : {postdata?.write_time}</p>
                </div>
                <div className='bulletinnotice-view'>
                    <p>조회수 : {postdata?.view} 회</p>
                    <p>좋아요 : {postdata?.like}</p>
                </div>
            </div>
            <div className='bulletinnotice-r'>
                {/* 나중에 처리결정 */}
            </div>
        </div>
    )
}



interface Postdata_guest {
    age: number[],
    content: string,
    date: string,
    level: string,
    no: number,
    position: boolean[],
    recruitment: number[],
    sex: string,
    stadium: string,
    time: string,
    write_time: string,
    writer_id: string,
    _id: string,
    end: boolean
}

interface Postdata_guest_props {
    postdata: Postdata_guest | null | undefined
}

interface Postdata_team {
    _id: string,
    url: string,
    time: boolean[],
    team_leader: string,
    team_founder: string,
    team_found_date: string,
    stadium: string,
    sex: boolean[],
    no: number,
    name: string,
    member_count: number,
    level: boolean[],
    day: boolean[],
    area: string,
    age: boolean[]
}

interface Postdata_team_props {
    postdata: Postdata_team | null | undefined
}

interface Postdata_bulletin {
    classification: 1 | 2 | 3,
    comment: number,
    content: string,
    like: number,
    no: number,
    title: string,
    view: number,
    write_time: string,
    writer_id: string,
    _id: string,
    writer_nickname: string
}

interface Postdata_bulletin_props {
    postdata: Postdata_bulletin | undefined
}

let stadium: string[] = ['잠실야구장', '고척스카이돔', '랜더스필드', '이글스파크', '엔씨파크', '라이온즈파크', '사직구장', '챔피언스필드'];
let position: string[] = ['내야수', '외야수', '포수', '투수'];
let level: string[] = ['취미', '4부', '3부', '2부', '1부'];
let optionarray: string[][] = [stadium, position, level]
let optionstring: (keyof Postdata_guest)[] = ['stadium', 'position', 'level']
let optiontype: string[] = ['위치', '포지션', '레벨']

export { FindGuest, FindTeammate, Bulletin }
