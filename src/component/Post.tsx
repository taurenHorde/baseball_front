import styled from 'styled-components'
import './../css/post.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { LoadingBar, LoadingDot } from './Nav';
import moment from 'moment'

require('moment/locale/ko');

const { kakao }: any = window;

const positionColor = ['#879DE0', '#d187e0', '#AA87E0', '#2dc7db']

interface PositionColor {
    $positionBg?: string
}

interface KakaoProps {
    stadium: any;
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

interface Postdata_team {
    _id: string,
    url: string,
    time: string[],
    team_leader: string,
    team_founder: string,
    team_found_date: string,
    stadium: string,
    sex: string[],
    no: number,
    name: string,
    member_count: number,
    level: string[],
    day: string[],
    area: string,
    age: string[]
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

interface Postdata_bulletin_comment {
    post_id: string,
    writer_id: string,
    writer_time: string,
    comment: string,
    writer_nickname: string,
    _id: string
}

let PostionDiv = styled.div<PositionColor>`
width: 50px;
height: 25px;
border: none;
background: ${props => props.$positionBg};
display: flex;
justify-content: center;
align-items: center;
font-size: 0.8rem;
color: white;
`

function Guestpost() {
    const { id } = useParams();
    const navigate = useNavigate()
    const [loading, setLoading] = useState<boolean>(false)
    const [empty, setEmpty] = useState<boolean>(false)
    const [postdata, setPostdata] = useState<Postdata_guest | null | undefined>();
    const [nickname, setNickname] = useState<string>("")
    const postPositionRecruitment: (number | undefined)[] = [] // 포지션별 모집인원
    const postPositionRecruitmentFix: (number | undefined)[] = [] // 포지션별 현재 확정인원
    const postPosition: (string | undefined)[] = ['내야수', '외야수', '포수', '투수']
        .map((val, idx) => {
            if (postdata?.position[idx]) {
                postPositionRecruitment.push(postdata?.recruitment[idx])
                postPositionRecruitmentFix.push(postdata?.recruitment_fix[idx])
                return val
            } else {
                postPositionRecruitment.push(undefined)
                postPositionRecruitmentFix.push(undefined)
                return undefined
            }
        })
    // Posi-Recr 로 배열 만들어 놓고, post Posti 으로 구인 수 확인
    // postPosition 은 맴버 중 구하는 맴버만 출이는 작업
    const postTimeText = `${moment(postdata?.date).locale('ko').format('M월 D일 dddd')} ${postdata?.time}`;
    const postAgeText = postdata?.age[0] === postdata?.age[1] ? `${postdata?.age[0]} 대` : `${postdata?.age[0]} ~ ${postdata?.age[1]}대`
    // 위 3개는 text 변경
    const [checkWriter, setCheckWriter] = useState<boolean>(false)
    const [checkApply, setCheckApply] = useState<number>(0)
    const [modal_postG, setModal_postG] = useState<boolean>(false)
    // 신청 모달 
    const [selectPostion_postG, setSelectPostion_postG] = useState<boolean[]>([false, false, false, false])

    useEffect(() => {
        fetch('/api/post/guest/' + id, {
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
                await setCheckApply(res.check_apply)
                await setCheckWriter(res.check_write)
                await setPostdata(res.post_data)
                await setNickname(res.writer_nickname)
                return await setLoading(true)
            } else {
                if (res.false_code === 4) {
                    await setLoading(true)
                    return await setEmpty(true)
                }
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    async function select_position(postion: string, idx: number) {
        var copy = await [...selectPostion_postG]
        copy[idx] = await !copy[idx]
        await setSelectPostion_postG(copy)
        return
    }

    async function submit_joinG() {
        if (!selectPostion_postG.includes(true)) return alert('하나 이상의 포지션을 선택해야합니다.')
        fetch('/api/post/joinguest/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                select: selectPostion_postG
            })
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
                await window.location.reload()
                return
            } else {
                if (res.false_code === 1) alert('비 로그인상태에선 신청하실 수 없습니다.')
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }


    return (
        <div className="Guestpost-wrap Post-wrap">
            {!loading && (<><LoadingBar /><LoadingDot /></>)}
            {loading && empty && (<Emptypost postType={['guest', '게스트 모집']} />)}
            {loading && !empty && (<>
                {/* <div className='guestpost-photo post-photo'>
                    <h3>Photo' Space</h3>
                </div> */}
                <div className='guestpost-content post-content'>
                    <div className='guestpost-content-l post-content-l'>
                        <div className='guestpost-content-section'>
                            <div className='guestpost-content-title'>
                                <h5>게스트 모집합니다!</h5>
                            </div>
                            <div className='guestpost-content-host'>
                                <h6>작성자 : {nickname}</h6>
                            </div>
                            <div className='guestpost-content-info'>
                                <div><p> ⚾ {postAgeText}</p></div>
                                <div><p> ⚾ {postdata?.sex}</p></div>
                                <div><p> ⚾ {postdata?.level} 수준</p></div>
                                <div><p> ⚾ 모집포지션({
                                    postPosition.map((val, idx) => {
                                        if (postdata?.recruitment[idx]) return ` ${val} `
                                        return ``
                                    })})</p></div>
                            </div>
                            <div className='guestpost-content-memo'>
                                <p>
                                    {postdata?.content}
                                </p>
                            </div>
                            <div className='guestpost-content-warning'>
                                <p> 📢 신청 전 위 내용들과 경기시간 및 장소를 반드시 확인 바랍니다.</p>
                            </div>
                        </div>
                        <div className='guestpost-content-section'>
                            <div className='guestpost-content-position'>
                                <h5>모집 정보</h5>
                                {postPosition.map((val, idx) => {
                                    const recruitmentFullCheck = (postPositionRecruitment[idx] === postPositionRecruitmentFix[idx])
                                    if (!val) return null;
                                    return (
                                        <div key={idx}
                                            className={recruitmentFullCheck ? "recruitmentfull" : ""}>
                                            <PostionDiv $positionBg={positionColor[idx]}>
                                                <p>{val}</p>
                                            </PostionDiv>
                                            <p>{postPositionRecruitmentFix[idx]}명 / {postPositionRecruitment[idx]}명</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className='guestpost-content-section'>
                            <div className='guestpost-content-regulation'>
                                <h5>주의사항</h5>
                                <p> ㆍ 미출석 및 허위모집은 추 후 서비스를 이용 시 불이익이 있습니다.</p>
                                <p> ㆍ 모집이 끝난 포지션은 자동으로 신청이 막힙니다.</p>
                            </div>
                        </div>
                    </div>
                    <div className='guestpost-content-r post-content-r'>
                        <div className='guestpost-content-section'>
                            <div className='guestpost-content-apply'>
                                <h5>게스트 모집</h5>
                                <h6>{postTimeText}</h6>
                                <h5>{postdata?.stadium}</h5>
                                {/* <p>경기도 동두천시 어쩌구저쩌구 000-00 동두천시청 지하주차장 B구역 203라인 </p> */}
                                <div className='kakaomap'>
                                    <Kakao stadium={postdata?.stadium}></Kakao>
                                </div>
                                <p>지도를 누르면 kakao 길찾기로 이동합니다.</p>
                            </div>
                            <div className='guestpost-content-button'>
                                {checkWriter ? <>
                                    <p
                                        className='pointer'
                                        onClick={() => { navigate(`/guestpost/${id}/admin`) }}
                                    >관리페이지로</p>
                                </> : <>
                                    {postdata?.end ? <>
                                        <div className='close-div'>
                                            <button>
                                                모집종료
                                            </button>
                                        </div>
                                    </> : <>
                                        <div>
                                            {checkApply ? <>
                                                <div>
                                                    <p>{checkApply === 1 ? "게스트 신청중" : "신청 확정"}</p>
                                                    {/* <p>신청취소하기</p> */}
                                                </div>
                                            </> : <>
                                                <button
                                                    className='pointer'
                                                    onClick={() => {
                                                        setModal_postG(true)
                                                    }}
                                                >신청</button>
                                            </>}
                                        </div>
                                    </>}
                                    <div>
                                        {/* <button
                                            className='pointer'
                                        >문의</button> */}
                                    </div>
                                </>}
                            </div>
                        </div>
                    </div>
                </div>
                {modal_postG && (
                    <div className='modal'>
                        <div className='modalteam-guest'>
                            <div className='modalteam-guest-title'>
                                <h5>게스트 신청하기</h5>
                            </div>
                            <div className='modalteam-guest-body'>
                                <div className='guest-info'>
                                    <p> 포지션별 중복 신청이 가능합니다.</p>
                                    <p> 원하시는 포지션 클릭 후 신청하기 버튼을 눌러주세요.</p>
                                </div>
                                <div className='guest-select'>
                                    {postPosition.map((val, idx) => {
                                        const recruitmentFullCheck = (postPositionRecruitment[idx] === postPositionRecruitmentFix[idx])
                                        if (!val) return <></>;
                                        return (
                                            <div className={selectPostion_postG[idx] ? 'guset-select-box select' : 'guset-select-box'}
                                                key={idx}
                                                onClick={() => {
                                                    if (!recruitmentFullCheck) return select_position(val, idx);
                                                    return;
                                                }}
                                                style={{ background: selectPostion_postG[idx] ? `${positionColor[idx]}` : "" }}
                                            >
                                                <div className='select-box-head'>
                                                    <p>{val}</p>
                                                </div>
                                                <div
                                                    className={recruitmentFullCheck ? 'select-box-body recruitmentfull' : 'select-box-body'}>
                                                    <p>{postPositionRecruitmentFix[idx]}/{postPositionRecruitment[idx]}명</p>
                                                    <p>
                                                        {recruitmentFullCheck ? '신청불가' : '신청가능'}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className='modalteam-guest-button'>
                                <div className='select-button'>
                                    <button
                                        onClick={() => { submit_joinG() }}
                                    >신청</button>
                                    <button
                                        onClick={() => { setModal_postG(false) }}
                                    >취소</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>)}
        </div>
    )
}

function Teampost() {
    const { id } = useParams();
    const navigate = useNavigate()
    const [loading, setLoading] = useState<boolean>(false)
    const [empty, setEmpty] = useState<boolean>(false)
    const [postdata, setPostdata] = useState<Postdata_team | undefined | null>()
    const [rating, setRating] = useState<number | null>(0)
    var postDayText: string | null = "";
    var postAgeText: string | null = "";

    useEffect(() => {
        fetch('/api/post/team/' + id, {
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
                await setPostdata(res.team_data)
                await setRating(res.myrating)
                await setLoading(true)
                return;
            } else {
                if (res.false_code === 4) {
                    await setLoading(true)
                    return await setEmpty(true)
                }
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    async function submit_joinT() {
        fetch('/api/post/jointeam/' + id, {
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
                alert('가입신청이 완료되었습니다.')
                window.location.reload();
                return;
            } else {
                if (res.false_code === 1) {
                    alert('로그인상태가 아닙니다.')
                    navigate('/login')
                    return
                }
                console.log(res)
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    const postAgeFisrtLastText = `${postdata?.age.slice(0, 1)[0]} ~ ${postdata?.age.slice(-1)[0]}`
    const postDayFisrtText = postdata?.day.map((val) => { return val[0] })
    if (postdata?.day) postDayText = postdata?.day.length > 1 ? `${postDayFisrtText} ` : `${postdata?.day} `
    if (postdata?.age) postAgeText = postdata?.age.length > 1 ? `${postAgeFisrtLastText} ` : `${postdata?.age} `

    return (
        <div className="Teampost-wrap Post-wrap">
            {!loading && (<><LoadingBar /><LoadingDot /></>)}
            {loading && empty && (<Emptypost postType={['team', '팀원 모집']} />)}
            {loading && !empty && (<>
                {/* <div className='teampost-photo post-photo'>
                </div> */}
                <div className='teampost-content post-content'>
                    <div className='teampost-content-l post-content-l'>
                        <div className='teampost-content-section'>
                            <div className='teampost-content-title'>
                                <div className='teampost-content-logo'>
                                    <p>Logo</p>
                                </div>
                                <div className='teampost-content-info'>
                                    <h5>{postdata?.name}</h5>
                                    <p>{postdata?.area}ㆍ{postdata?.level}</p>
                                    {rating === 1 || rating === 2 ?
                                        <p style={{ textDecoration: "underline" }}
                                            className='pointer'
                                            onClick={() => { navigate(`/teampost/${postdata?.url}/admin`) }}
                                        >관리자 페이지로</p>
                                        : <></>
                                    }

                                </div>
                            </div>
                            <div className='teampost-content-info2'>
                                <div><p>⚾ {postdata?.area}</p></div>
                                <div><p>⚾ {postdata?.stadium}</p></div>
                                <div><p>⚾ {postdata?.level}</p></div>
                                <div><p>⚾ {postdata?.time}</p></div>
                                <div><p>⚾ {postDayText ?? ""}</p></div>
                                <div><p>⚾ {postAgeText ?? ""}</p></div>
                            </div>
                            <div className='teampost-content-button'>
                                {rating === 1 || rating === 2 || rating === 3 ? <></> : <>
                                    {rating !== 4 ?
                                        <button onClick={() => { submit_joinT() }}>가입신청</button>
                                        :
                                        <>
                                            <div>
                                                <p>가입 신청중..</p>
                                            </div>
                                            <div>
                                                {/* <p>취소하기</p> */}
                                            </div>
                                        </>
                                    }
                                    {/* <button>문의하기</button> */}
                                </>}
                            </div>
                        </div>
                    </div>
                    <div className='teampost-content-r post-content-r'>
                        <div className='teampost-content-section'>
                            <div className='teampost-content-memo'>
                                {/* 변경해야함 */}
                                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam impedit perspiciatis at quas! At dolor ipsa recusandae esse qui adipisci quis voluptatum minus. Repudiandae impedit animi enim aliquid officia minima!</p>
                            </div>
                            <div className='teampost-content-view'>
                                {/* <p>조회 45억 2812만 ㆍ 신청 7억 2319만</p>
                                <p>업데이트 24억년 전</p> */}
                            </div>
                        </div>
                    </div>
                </div>
            </>)}
        </div>
    )
}

function Bulletinpost() {
    const { id } = useParams();

    const [loading, setLoading] = useState<boolean>(false)
    const [empty, setEmpty] = useState<boolean>(false)
    const [postdata, setPostdata] = useState<Postdata_bulletin>()
    const [postdataLike, setPostdataLike] = useState<number>(0)
    const [postdataComment, setPostdataComment] = useState<number>(0)
    const [userLike, setUserLike] = useState<boolean | undefined>();
    const [userId, setUserId] = useState<string>('')
    const [comment_postB, setComment_postB] = useState<string>('')
    const [comment, setComment] = useState<Postdata_bulletin_comment[]>()

    useEffect(() => {
        fetch('/api/post/bulletin/' + id, {
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
                await setComment(res.comment)
                await setUserId(res.user)
                await setUserLike(res.userThisPost)
                await setPostdata(res.post_data)
                await setPostdataLike(res.post_data.like)
                await setPostdataComment(res.post_data.comment)
                await setLoading(true)
                return
            } else {
                if (res.false_code === 4) {
                    await setLoading(true)
                    return await setEmpty(true)
                }
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    async function bulletin_like() {
        setUserLike(!userLike)
        fetch('/api/post/bulletin/like/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                userLike: !userLike,
            })
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    async function comment_submit() {
        fetch('/api/post/bulletin/comment/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                comment: comment_postB
            })
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
                await setComment_postB('')
                await setComment(res.comment)
                await setPostdataComment(res.commentLength)
                return
            } else {
                console.log(res)
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    async function comment_delete(commandId: string) {
        fetch('/api/post/bulletin/delete/comment/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                commentId: commandId
            })
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
                await setComment(res.comment)
                await setPostdataComment(res.commentLength)
                return
            } else {
                console.log(res)
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    return (
        <div className="Bulletinpost-wrap">
            {!loading && (<><LoadingBar /><LoadingDot /></>)}
            {loading && empty && (<Emptypost postType={['bulletin', '자유 게시판']} />)}
            {loading && !empty && (<>
                <div className='bulletinpost-head'>
                    <div className='post-title'>
                        <h5>
                            {['자유', '후기', '질문'].map((val, idx) => idx === postdata?.classification ? `[${val}]   ` : "")}
                            {postdata?.title}
                        </h5>
                    </div>
                    <div className='post-info'>
                        <div className='post-info-l'>
                            <div className='post-nickname'>
                                <p>{postdata?.writer_nickname}</p>
                            </div>
                            <div className='post-date'>
                                <p>{postdata?.write_time}</p>
                            </div>
                        </div>
                        <div className='post-info-r'>
                            <div className='post-view'>
                                <p>조회수  {postdata?.view}</p>
                            </div>
                            <div className='post-like'>
                                <p>좋아요  {postdataLike}</p>
                            </div>
                            <div className='post-comment'>
                                <p>댓글  {postdataComment}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='bulletinpost-body'>
                    <div className='post-content'>
                        <p>
                            {postdata?.content}
                        </p>
                    </div>
                    <div className='post-box'>
                        {/* 좋아요 같은거 하는 곳 */}
                        <div className={userLike ? 'like-button userlike' : 'like-button'}
                            onClick={async () => {
                                if (!userId) return alert('게시물 좋아요를 하려면 로그인을 해야합니다.')
                                setPostdataLike((pre) => userLike ? pre - 1 : pre + 1)
                                return bulletin_like()
                            }} >
                            <p>{userLike ? "♥" : "♡"}</p>
                        </div>
                    </div>
                </div>
                <div className='bulletinpost-footer'>
                    <div className='post-write-comment'>
                        <input
                            type='text'
                            placeholder={userId ? "댓글을 남겨주세요." : "댓글을 남기시려면 로그인이 필요합니다."}
                            value={comment_postB}
                            disabled={userId ? false : true}
                            maxLength={200}
                            onChange={(e) => setComment_postB(e.target.value)}
                        />
                        <button onClick={comment_submit}>전송</button>
                    </div>
                    <div className='post-view-comment'>
                        {comment !== undefined && comment.length === 0 ? <></> : <>
                            {comment?.map((val, idx) => {
                                const commentId = val._id
                                return (
                                    <div className='comment' key={idx}>
                                        <div className='comment-nickname'>
                                            <p>{val.writer_nickname}
                                                {userId === val.writer_id && (<span onClick={() => comment_delete(commentId)}> ❌ </span>)}
                                            </p>
                                            <p>{val.writer_time}</p>
                                        </div>
                                        <div className='comment-content'>
                                            <p>
                                                {val.comment}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </>}
                    </div>
                </div>
            </>)}
        </div>
    )
}

function Emptypost(props: { postType: string[] }) {
    const navigate = useNavigate();
    const { postType } = props
    return (
        <div className="Emptypost-wrap">
            <div className='emptypost-box'>
                <h6> 4 0 4</h6>
                <p>접속하신 주소에 해당하는 {postType[1]} 게시글 정보가 없습니다.</p>
                <button
                    onClick={() => navigate(`/board/${postType[0]}`)}
                >게시판({postType[1]}) 이동하기</button>
            </div>
        </div>
    )
}


function Kakao(props: KakaoProps) {

    type stadiummapType = {
        name: string;
        lat: number;
        lon: number;
        id: number;
    };
    let stadiumMap: stadiummapType[] = [
        { name: '위즈파크', lat: 37.29967438659638, lon: 127.00980136384605, id: 17577962 },
        { name: '잠실야구장', lat: 37.51205948260811, lon: 127.07190263259021, id: 20740490 },
        { name: "랜더스필드", lat: 37.436899633771745, lon: 126.69329912761006, id: 8053130 },
        { name: '사직야구장', lat: 35.19397929487557, lon: 129.06167478845023, id: 8396881 },
        { name: '고척스카이돔', lat: 37.49823485357189, lon: 126.86719636030573, id: 7890664 },
        { name: '엔씨파크', lat: 35.22274249291124, lon: 128.5821497207587, id: 26542435 },
        { name: '챔피언스필드', lat: 35.1681393644369, lon: 126.88910941215897, id: 21755436 },
        { name: '이글스파크', lat: 36.31706721430381, lon: 127.42908737853345, id: 8131581 },
        { name: '라이온즈파크', lat: 35.84102725825763, lon: 128.6815209789601, id: 12864272 }
    ]


    let stadium = stadiumMap.filter((a) => a.name === props.stadium)
    let [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        setLoading(true)

    }, [])
    useEffect(() => {
        if (loading) {
            var container = document.getElementById('map');
            var options = {
                center: new kakao.maps.LatLng(stadium[0]?.lat, stadium[0]?.lon),
                level: 3
            };
            var map = new kakao.maps.Map(container, options);
        }
    }, [loading, stadium])
    return (
        <>
            <div id="map" style={{ width: '100%', aspectRatio: '1/0.8' }} onClick={() => {
                window.open(`https://map.kakao.com/link/to/${stadium[0].id}`);
            }}></div >
        </>
    )

};


export { Guestpost, Teampost, Bulletinpost }