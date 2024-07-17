
import './../css/guest_admin.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { LoadingBar } from './Nav';
import styled from 'styled-components'
require('moment/locale/ko');

const positionColor = ['#879DE0', '#d187e0', '#AA87E0', '#2dc7db']

interface PositionColor {
    $positionBg?: string
}

type FunType = (type: string) => void;

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

interface Undetermined {
    _id: string,
    post_id: string,
    user_id: string,
    nickname: string,
    submit_position: boolean[],
    confirm: boolean,
    application_date: string
}

interface Undetermined_props {
    userData: Undetermined | undefined
    changeCheck: FunType;
    checkRecuitment: boolean[] | undefined
}

interface Approval {
    _id: string,
    post_id: string,
    user_id: string,
    nickname: string,
    submit_position: boolean[],
    confirm: boolean,
    approval: boolean,
    approval_postion: boolean[],
    join_date: string
}

interface Approval_props {
    userData: Approval | undefined
    changeCheck: FunType;
}

interface PostCount {
    approval_count: boolean[],
    undetermined_count: boolean[]
}

let PostionDivCon = styled.div<PositionColor>`
width: 60px;
height: 25px;
margin : 2.5px 0px;
border: none;
background: ${props => props.$positionBg};
display: flex;
justify-content: center;
align-items: center;
font-size: 0.8rem;
color: white;
user-select: none;
`;

let PostionDivUn = styled.div<PositionColor>`
width: 40px;
height: 20px;
border: none;
background: ${props => props.$positionBg};
display: flex;
justify-content: center;
align-items: center;
font-size: 0.7rem;
color: white;
margin: 0px 2px;
user-select: none;
`

let PostionDiv = styled.div<PositionColor>`
background: ${props => props.$positionBg};
padding: 3px 7px;
color: white;
margin: 0px 2px;
box-sizing: border-box;
user-select: none;
cursor:pointer
`;

function Guestpostadmin() {

    const { id } = useParams();
    const navigate = useNavigate()
    const [loading, setLoading] = useState<boolean>(false)
    const [loadingHttp, setLoadingHttp] = useState<boolean>(true) // https 신청동안 클릭 막기 
    const [reHttp, setReHttp] = useState<boolean>(false)

    const [postdata, setPostdata] = useState<Postdata_guest | undefined>();
    const [postdata_end, setPostdata_end] = useState<boolean>(false)

    const [originUndeterminedData, setOriginUndeterminedData] = useState<Undetermined[] | undefined>()
    const [undeterminedData, setUndeterminedData] = useState<Undetermined[] | undefined>()

    const [undeterminedPage, setUndeterminedPage] = useState<number>(1)
    // [0] = 사용자가 현재 보던 페이지
    const [undeterminedPageArr, setUndeterminedPageArr] = useState<number[]>([1])
    //  데이터 / 5 를 ceil 한 수
    const [undeterminedFilter, setUndeterminedFilter] = useState<number | boolean>(false)
    const [checkRecuitment, setCheckRecuitment] = useState<boolean[] | undefined>()
    // 확정인원 만큼 도달 했는지 확인용 - 수락 창 막기용임 

    const [originApprovalData, setOriginApprovalData] = useState<Approval[] | undefined>()
    const [approvalData, setApprovalData] = useState<Approval[] | undefined>()
    const [approvalDataFilter, setApprovalFilter] = useState<number | boolean>(false)

    const [postCount, setPostCount] = useState<PostCount | undefined>()
    const postPositionRecruitment: (number | undefined)[] = []
    const postPosition: (string | undefined)[] = ['내야수', '외야수', '포수', '투수']
        .map((val, idx) => {
            if (postdata?.position[idx]) {
                postPositionRecruitment.push(postdata?.recruitment[idx])
                return val
            } else {
                postPositionRecruitment.push(undefined)
                return undefined
            }
        })

    const [recruitmentCloseModal, setRecruitmentCloseModal] = useState<boolean>(false)
    const [recruitmentClose, setRecruitmentClose] = useState<boolean>(false)

    async function propsChangeCheck(type: string) {
        await setLoadingHttp(false)
        return await setReHttp(!reHttp)
    }

    useEffect(() => {
        fetch('/api/post/guestadmin/' + id, {
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
                await setOriginUndeterminedData(res.guest_undetermined)
                await setOriginApprovalData(res.guest_approval)
                await setPostdata(res.guest_post)
                await setPostCount(res.guest_count)
                await setCheckRecuitment(res.recuitment_check)
                await setPostdata_end(res.guest_post.end)
                await setLoadingHttp(true)
                return await setLoading(true)
            } else {
                if (res.false_code === 1) {
                    alert('로그인페이지로 이동합니다.')
                    navigate('/login')
                }
                console.log(res)
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [reHttp])

    async function positionFilter_termination(type: string) {
        if (type === 'undetermined') {
            await setUndeterminedPage(1)
            await setUndeterminedData(originUndeterminedData)
            await setUndeterminedFilter(false)
            if (originUndeterminedData !== undefined) await positionUn_page(originUndeterminedData)
            return
        }
        if (type === 'approval') {
            await setApprovalData(originApprovalData)
            await setApprovalFilter(false)
            return
        }
        return
    }

    // //////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        setUndeterminedData(originUndeterminedData)
        positionUn_filter(undeterminedFilter)
    }, [originUndeterminedData])

    async function positionUn_filter(position: number | boolean) {
        await setUndeterminedPage(1)
        var postData_copy = await originUndeterminedData;
        if (!postData_copy) return;
        const postData_filter: (Undetermined[] | undefined) = await [];
        if (typeof (position) === 'number') {
            await setUndeterminedFilter(position)
            for (var i = 0; i < postData_copy?.length; i++) {
                if (postData_copy[i].submit_position[position]) await postData_filter.push(postData_copy[i])
            }
            postData_copy = await postData_filter
        }
        await setUndeterminedData(postData_copy)
        await positionUn_page(postData_copy)
        return
    }

    async function positionUn_page(data: Undetermined[]) {
        const postDataLengthDivisionFive = await Math.ceil(data.length / 5)
        const postDataPageArray = await Array.from({ length: postDataLengthDivisionFive }, (_, i) => i + 1);
        await setUndeterminedPageArr(postDataPageArray)
        return
    }
    // //////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        setApprovalData(originApprovalData)
        positionCon_filter(approvalDataFilter)
    }, [originApprovalData])

    async function positionCon_filter(position: number | boolean) {

        var postData_copy = await originApprovalData;
        if (!postData_copy) return;
        const postData_filter: (Approval[] | undefined) = await [];
        if (typeof (position) === 'number') {
            await setApprovalFilter(position)
            for (var i = 0; i < postData_copy?.length; i++) {
                if (postData_copy[i].approval_postion[position]) await postData_filter.push(postData_copy[i])
            }
            postData_copy = await postData_filter
        }
        await setApprovalData(postData_copy)
        return
    }

    // ///////////////////////////////////////////////////////////////

    async function recruitment_close() {
        setLoading(false)
        fetch('/api/post/guestadmin/end/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
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
                setLoading(true)
                setPostdata_end(true)
                setRecruitmentCloseModal(false)
                return;
            } else {
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })

    }

    console.log(postdata)
    return (
        <div
            className={loadingHttp ? "Guestpostadmin-Wrap" : "Guestpostadmin-Wrap Loadinghttp"}
        >
            {!loading && (<LoadingBar />)}
            {!loadingHttp && (<LoadingBar />)}
            {loading && (<>
                <div className='pd20'>
                    <div className='guestpostadmin-button'>
                        {postdata_end ?
                            <>
                                <p>종료 된 모집글 입니다.</p>
                            </> : <>
                                <p
                                    onClick={() => {
                                        setRecruitmentCloseModal(true)
                                    }}
                                >모집종료</p>
                            </>}
                    </div>
                    {postdata_end ?
                        <>
                            <p>종료 된 모집글 입니다.</p>
                            <p>확정 인원 취소처리만 가능합니다.</p>
                        </> : <>
                            <div className='guestpostadmin-undetermined'>
                                <div className='guestpostadmin-title'>
                                    <h5>
                                        {typeof (undeterminedFilter) === 'number' &&
                                            <span style={{ background: `${positionColor[undeterminedFilter]}` }}>
                                                {postPosition[undeterminedFilter]}
                                            </span>}
                                        신청 현황 ({undeterminedData?.length}명)</h5>
                                    <div>
                                        {postPosition.map((val, idx) => {
                                            if (!val) return <></>;
                                            return (
                                                <PostionDiv
                                                    $positionBg={positionColor[idx]}
                                                    key={idx}
                                                    onClick={() => {
                                                        positionUn_filter(idx)
                                                    }}
                                                >
                                                    {val} {postCount?.undetermined_count[idx]}건
                                                </PostionDiv>
                                            )
                                        })}
                                        {typeof (undeterminedFilter) === 'number' ? <>
                                            <p
                                                onClick={() => {
                                                    positionFilter_termination('undetermined')
                                                }}
                                            > 필터종료</p>
                                        </> : <></>}
                                    </div>
                                </div>
                                <div className='guestpostadmin-body'>
                                    {undeterminedData ?
                                        <>
                                            {undeterminedData.map((val, idx) => {
                                                if (idx >= (undeterminedPage - 1) * 5 && idx <= (undeterminedPage * 5) - 1) {
                                                    return <GuestpostadminDivUn key={idx} userData={val} changeCheck={propsChangeCheck} checkRecuitment={checkRecuitment} />
                                                }
                                                return <></>
                                            })}
                                        </>
                                        :
                                        <p>자료없다</p>}
                                </div>
                                <div className='guestpostadmin-page'>
                                    <div className='current-page'>
                                        <p>현재페이지 : {undeterminedPage}</p>
                                    </div>
                                    <div className='select-page'>
                                        {undeterminedPageArr.map((val, idx) => {
                                            return (
                                                <p
                                                    key={idx}
                                                    className='pointer'
                                                    onClick={async () => {
                                                        await setUndeterminedPage(val)
                                                    }}
                                                >{val}</p>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </>}
                    <div className='guestpostadmin-confirmation'>
                        <div className='guestpostadmin-title'>
                            <h5>
                                {typeof (approvalDataFilter) === 'number' &&
                                    <span style={{ background: `${positionColor[approvalDataFilter]}` }}>
                                        {postPosition[approvalDataFilter]}
                                    </span>}
                                확정 인원 ({approvalData?.length}명)
                            </h5>
                            <div>
                                {postPosition.map((val, idx) => {
                                    if (!val) return <></>;
                                    return (
                                        <PostionDiv
                                            $positionBg={positionColor[idx]}
                                            key={idx}
                                            onClick={() => {
                                                positionCon_filter(idx)
                                            }}
                                        >
                                            {val} {postCount?.approval_count[idx]}/{postPositionRecruitment[idx]}명
                                        </PostionDiv>
                                    )
                                })}
                                {typeof (approvalDataFilter) === 'number' ? <>
                                    <p
                                        onClick={() => {
                                            positionFilter_termination('approval')
                                        }}
                                    > 필터종료</p>
                                </> : <></>}
                            </div>
                        </div>
                        <div className='guestpostadmin-body'>
                            {approvalData ?
                                <>
                                    {approvalData.map((val, idx) => {
                                        return <GuestpostadminDivCon key={idx} userData={val} changeCheck={propsChangeCheck} />
                                    })}
                                </>
                                :
                                <p>자료없다</p>}
                        </div>
                    </div>
                    <div className='guestpostadmin-info'>
                        <div className='guestpostadmin-title'>
                            <h5> 안내사항 </h5>
                        </div>
                        <div className='guestpostadmin-body'>
                            <p>⚾ 신청 현황 및 확정 인원 및 포지션을 클릭하면 해당 포지션 필터가 적용됩니다.</p>
                            <p>⚾ 모집인원만큼 모집이 마무리 된 포지션은 신청자의 원할한 이용을 위해 빠르게 거절을 해주시길 바랍니다.</p>
                            <p>⚾ 더 이상 모집을 원하지 않는다면 우측 상단 모집종료를 눌러주세요.</p>
                            <p>⚾ 당일날까지 모집 종료가 안 된 모집은 자동으로 모집 종료처리가 됩니다. (0시 일괄적용)</p>
                            <p>⚾ 모집종료시 신청대기 인원들은 자동으로 거절처리 됩니다.</p>
                        </div>
                    </div>
                </div>
            </>)
            }
            {recruitmentCloseModal && (
                <div className='modal'>
                    <div className="modal-guestadmin">
                        <div className='modal-guestadmin-management'>
                            <div className='modal-guestadmin-title'>
                                <h5>모집 종료</h5>
                            </div>
                            <div className='modal-guestadmin-body'>
                                <div>
                                    <div className='management-title'>
                                        <p>모집종료 시 신청 대기 건은 자동으로 거절 처리 됩니다.</p>
                                        <p>모집을 종료하시겠습니까?</p>
                                    </div>
                                    <div className='management-body'>
                                        <div className='close-body'>
                                            {postPosition.map((val, idx) => {
                                                const unprovidedPostion = (postdata?.recruitment[idx] === postdata?.recruitment_fix[idx])
                                                if (!val || unprovidedPostion) return <></>;
                                                return (
                                                    <p>
                                                        포지션 {val} : 모집인원({postdata?.recruitment[idx]}명) 만큼 모집하지 못했습니다.
                                                    </p>
                                                )
                                            })}

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='modal-guestadmin-button'>
                                {recruitmentClose ? <>
                                    <button className='pointer'
                                        onClick={() => {
                                            recruitment_close()
                                        }}
                                    >모집종료 확인</button>
                                </> : <>
                                    <button className='pointer'
                                        onClick={() => {
                                            setRecruitmentClose(true)
                                            alert('모집을 종료하시려면 다시한번 확인버튼을 눌러주세요.')
                                        }}
                                    >모집종료</button>
                                </>}
                                <button className='pointer'
                                    onClick={() => {
                                        setRecruitmentCloseModal(false)
                                        setRecruitmentClose(false)
                                    }}
                                >나가기</button>
                            </div>
                        </div>
                    </div>
                </div >
            )}
        </div >
    )
}


function GuestpostadminDivUn(props: Undetermined_props) {
    //  신청 대기 인원들 .
    const { id } = useParams();
    const { userData, changeCheck, checkRecuitment } = props
    const positionText: string[] = ['내야수', '외야수', '포수', '투수']
    const [modal_adminG, setModal_adminG] = useState<boolean>(false)
    const [selectPostion_adminG, setSelectPostion_adminG] = useState<boolean[]>([false, false, false, false])

    async function select_position(idx: number) {
        var copy = await [...selectPostion_adminG]
        if (selectPostion_adminG[idx]) {
            copy[idx] = await !copy[idx]
        } else {
            for (var i = 0; i < selectPostion_adminG.length; i++) {
                copy[i] = await i === idx ? true : false
            }
        }
        await setSelectPostion_adminG(copy)
        return
    }

    async function submit_join_management_adminG(decision: boolean) {
        // decision = true 가입수락  / false 가입 거절
        const selectcheck = await selectPostion_adminG.includes(true)
        if (decision && !selectcheck) return alert('포지션을 선택해주세요.')
        fetch('/api/post/guestadmin/decision/join/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                decision: decision,
                selectposition: selectPostion_adminG,
                guest_id: userData?._id,
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
                await changeCheck('undetermined')
                await setModal_adminG(false)
                return;
            } else {
                console.log(res)
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    return (
        <div className='Guestpostadmin-Div-un'>
            <div className='guestpostadmin-div-l'>
                <div className='position'>
                    {userData?.submit_position.map((val, idx) => {
                        if (!val) return <></>
                        return (
                            <PostionDivUn $positionBg={positionColor[idx]} key={idx}>
                                {positionText[idx]}
                            </PostionDivUn>
                        )
                    })}
                </div>
                <div>
                    <p>닉네임 : {userData?.nickname}</p>
                    <p>신청일자 : {userData?.application_date}</p>
                </div>
            </div>

            <div className='guestpostadmin-div-r'>
                <button
                    className='pointer'
                    onClick={() => {
                        setModal_adminG(true)
                    }}
                >관리</button>
            </div>

            {
                modal_adminG && (
                    <div className='modal'>
                        <div className="modal-guestadmin">
                            <div className='modal-guestadmin-management'>
                                <div className='modal-guestadmin-title'>
                                    <h5>신청 관리</h5>
                                </div>
                                <div className='modal-guestadmin-body'>
                                    <div>
                                        <div className='management-title'>
                                            <p>수락을 하실 경우 하나의 포지션을 반드시 선택해야합니다.</p>
                                            <p>원활한 팀 구성을 위하여 최대한 빠르게 수락/거절 부탁드립니다.</p>
                                        </div>
                                        <div className='management-body'>
                                            {userData?.submit_position.map((val, idx) => {
                                                if (!val) return <></>
                                                return (
                                                    <div className={selectPostion_adminG[idx] ? 'position-box select' : 'position-box'}
                                                        key={idx}
                                                        onClick={() => {
                                                            if (checkRecuitment !== undefined && !checkRecuitment[idx]) {
                                                                select_position(idx)
                                                            }
                                                        }}
                                                        style={{ background: selectPostion_adminG[idx] ? `${positionColor[idx]}` : "" }}
                                                    >
                                                        <p>
                                                            {`${positionText[idx]}`}
                                                        </p>
                                                        <p>
                                                            {checkRecuitment !== undefined && checkRecuitment[idx] && ('수락불가')}
                                                        </p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className='modal-guestadmin-button'>
                                    <button className='pointer'
                                        onClick={() => {
                                            submit_join_management_adminG(true)
                                        }}
                                    >수락</button>
                                    <button className='pointer'
                                        onClick={() => {
                                            submit_join_management_adminG(false)
                                        }}
                                    >거절</button>
                                    <button className='pointer'
                                        onClick={() => {
                                            setModal_adminG(false)
                                            setSelectPostion_adminG([false, false, false, false])
                                        }}
                                    >나가기</button>
                                </div>
                            </div>
                        </div>
                    </div >
                )
            }
        </div >
    )
}

function GuestpostadminDivCon(props: Approval_props) {
    const { id } = useParams();
    const { userData, changeCheck } = props
    const positionText: string[] = ['내야수', '외야수', '포수', '투수']
    const [cancel, setCancel] = useState<boolean>(false) // 한번누르면 true , 다시한번 누르면 취소진행

    async function positionFix_cancel() {
        if (!cancel) {
            const text = await `${userData?.nickname}님을 취소하시려면 취소버튼을 다시한번 눌러주세요.`
            await alert(text);
            await setCancel(true);
            return
        } else if (cancel) {

            fetch('/api/post/guestadmin/cancel/' + id, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    userData: userData,
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
                    await changeCheck('Approval')
                    return;
                } else {
                    return;
                }
            }).catch((err) => {
                console.error(`오류코드 ${err.status} = ` + err);
            })


        }
    }

    return (
        <div className='Guestpostadmin-Div-con'>
            <div className='guestpostadmin-div-l'>
                <div>
                    <h5>{userData?.nickname}</h5>
                    <p>{userData?.join_date}</p>
                    <p
                        onClick={() => { positionFix_cancel() }}
                        style={{
                            textDecoration: "underline",
                            fontSize: '0.6rem',
                            cursor: 'pointer'
                        }}>
                        {cancel ?
                            '취소하기 재확인'
                            :
                            '취소하기'
                        }
                    </p>
                </div>
            </div>
            <div className='guestpostadmin-div-r'>
                {userData?.approval_postion.map((val, idx) => {
                    if (val) return (
                        <PostionDivCon $positionBg={positionColor[idx]} key={idx}>
                            <p>
                                {positionText[idx]}
                            </p>
                        </PostionDivCon>
                    )
                    return<></>;
                })}
            </div>
        </div>
    )
}

export default Guestpostadmin;