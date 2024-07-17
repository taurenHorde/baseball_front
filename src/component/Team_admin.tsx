import './../css/team_admin.css'
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import { LoadingBar, LoadingDot } from './Nav';
import moment from 'moment';

type FunType = () => void;

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

interface Memberdata_team {
    _id: string,
    user_id: string,
    team_id: string,
    nickname: string,
    member_rating: number,
    join_date: string,
    confirm: boolean | undefined,
    application_date: string | undefined
}

interface Memberdata_team_props {
    memberdata: Memberdata_team | undefined
    changeCheck: FunType;
}


const name_team_Reg: RegExp = /^[가-힣]{2,8}$/;
const url_team_Reg: RegExp = /^[a-z]+[a-z0-9]{2,10}$/;


function Teampostadmin() {
    const { id } = useParams();
    const navigate = useNavigate()

    return (
        <div className="Teampostadmin-wrap">
            <div className='teampostadmin-section'>
                <div
                    className='teampostadmin-menu pointer'
                    onClick={() => navigate(`/teampost/${id}/admin/setting`)}
                >
                    <h5>팀 정보 수정</h5>
                </div>
            </div>
            <div className='teampostadmin-section pointer'>
                <div className='teampostadmin-menu pointer'
                    onClick={() => navigate(`/teampost/${id}/admin/member`)}
                >
                    <h5>팀원 관리</h5>
                </div>
            </div>
            <div className='teampostadmin-section pointer'>
                <div className='teampostadmin-menu'>
                    <h5>대문 글 관리 (구현x)</h5>
                </div>
            </div>
            <div className='teampostadmin-section pointer'>
                <div className='teampostadmin-menu'
                    onClick={() => navigate(`/teampost/${id}`)}
                >
                    <h5>뒤로 가기</h5>
                </div>
            </div>
        </div>
    )
}

function Teampostadminsetting() {
    const { id } = useParams();
    const navigate = useNavigate()

    const [loading, setLoading] = useState<boolean>(false)

    const [originalData, setOriginalData] = useState<Postdata_team | null>()
    const [name_settingT, setName_settingT] = useState<string>("")
    const [url_settingT, setUrl_settingT] = useState<string>("")
    const [regCheckName, setRegCheckName] = useState<boolean>(true) // 중복확인 클릭시 reg확인
    const [regCheckUrl, setRegCheckUrl] = useState<boolean>(true) // 중복확인 클릭시 reg확인
    const [overlappingCheckName_settingT, setOverlappingCheckName_settingT] = useState<boolean>(true)
    const [overlappingCheckUrl_settingT, setOverlappingCheckUrl_settingT] = useState<boolean>(true)
    // reg 시 문제 없을 시 post 후 중복있으면 false, 사용가능하면 ture 안내문구를 위한 구분용
    const [overlappingResult_settingT, setOverlappingResult_settingT] = useState<boolean[]>([false, false])
    // 다시 true는 확정, false 변경가능 상태... 
    const [overlappingModal, setOverlappingModal] = useState<boolean>(false)
    const [overlappingModalContent, setOverlappingModalConetent] = useState<number>(0)
    // 모달 내 저장 루트 갈림용
    const [day_settingT, setDay_settingT] = useState<boolean[]>([false, false, false, false, false, false, false])
    const [time_settingT, setTime_settingT] = useState<boolean[]>([false, false, false, false])
    const [area_settingT, setArea_settingT] = useState<string>("")
    const [stadium_settingT, setStadium_settingT] = useState<string>("")
    const [age_settingT, setAge_settingT] = useState<boolean[]>([false, false, false, false])
    const [sex_settingT, setSex_settingT] = useState<boolean[]>([false, false, false])
    const [level_settingT, setLevel_settingT] = useState<boolean[]>([false, false, false, false, false])
    // 마지막 제출 때 파이널 확인용 - false 면 css 줄 예정 
    useEffect(() => {
        fetch('/api/post/teamadmin/update/' + id, {
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
                await setOriginalData(res.team_data)
                await setName_settingT(res.team_data.name)
                await setUrl_settingT(res.team_data.url)
                await setDay_settingT(res.team_data.day)
                await setTime_settingT(res.team_data.time)
                await setArea_settingT(res.team_data.area)
                await setStadium_settingT(res.team_data.stadium)
                await setAge_settingT(res.team_data.age)
                await setSex_settingT(res.team_data.sex)
                await setLevel_settingT(res.team_data.level)
                await setLoading(true)
                return;
            } else {
                if (res.false_code === 4) {
                    alert('잘못된 접근입니다.4')
                    navigate('/board/team')
                    return
                }
                if (res.false_code === 5) {
                    alert('잘못된 접근입니다.5')
                    navigate('/teampost/' + id)
                    return
                }
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    async function overlapping_check(type: number) {
        console.log('함수시작')
        var check_text = await type === 1 ? name_settingT : url_settingT;
        await setOverlappingModalConetent(type)
        var regcheck_result;
        if (await type === 1) {
            console.log('타입별 작동 1')
            regcheck_result = await name_team_Reg.test(name_settingT) ? true : false
            await setRegCheckName(regcheck_result)
        } else if (await type === 2) {
            console.log('타입별 작동 2')
            regcheck_result = await url_team_Reg.test(url_settingT) ? true : false
            await setRegCheckUrl(regcheck_result)
        }
        if (!regcheck_result) return alert(`입력하신 데이터가 서식에 맞지 않습니다.`)
        await fetch('/api/post/teamadmin/overlapping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                check_text: check_text,
                type: type
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
                console.log('ok 회신')
                setOverlappingModal(true)
                return;
            } else {
                console.log('no 회신')
                if (type === 1) {
                    setOverlappingCheckName_settingT(false)
                    alert(`입력하신 '${name_settingT}'는 이미 있습니다.`)
                }
                if (type === 2) {
                    setOverlappingCheckUrl_settingT(false)
                    alert(`입력하신 '${url_settingT}'는 이미 있습니다.`)
                }
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
        console.log('종료')
        return;
    }

    async function overlapping_decision() {
        var copy = await [...overlappingResult_settingT]
        if (overlappingModalContent === 1) {
            await setOverlappingCheckName_settingT(true)
            copy[0] = true;
        } else if (overlappingModalContent === 2) {
            await setOverlappingCheckUrl_settingT(true)
            copy[1] = true;
        }
        await setOverlappingResult_settingT(copy)
        await setOverlappingModal(false)
    }

    async function again_data(type: number) {
        // 1= 팀이름 / 2 = url
        var copy = await [...overlappingResult_settingT]
        if (type === 1) {
            copy[0] = await false
            await setName_settingT("")
        } else if (type === 2) {
            copy[1] = await false
            await setUrl_settingT("")
        } else {
            return
        }
        await setOverlappingResult_settingT(copy)
        return
    }

    async function reset_data(type: string) {
        var copy;
        if (type === 'name') {
            copy = await [...overlappingResult_settingT]
            await setRegCheckName(true);
            await setOverlappingCheckName_settingT(true)
            copy[0] = await false;
            await setOverlappingResult_settingT(copy)
            await setName_settingT(originalData?.name ?? "")
        } else if (type === 'url') {
            copy = await [...overlappingResult_settingT]
            await setRegCheckUrl(true);
            await setOverlappingCheckUrl_settingT(true)
            copy[1] = await false;
            await setOverlappingResult_settingT(copy)
            await setUrl_settingT(originalData?.url ?? "")
        } else if (type === 'day') {
            copy = await [...originalData?.day ?? []]
            await setDay_settingT(copy)
        } else if (type === 'time') {
            copy = await [...originalData?.time ?? []]
            await setTime_settingT(copy)
        } else if (type === 'area') {
            await setArea_settingT(originalData?.area ?? "")
        } else if (type === 'stadium') {
            await setStadium_settingT(originalData?.stadium ?? "")
        } else if (type === 'age') {
            copy = await [...originalData?.age ?? []]
            await setAge_settingT(copy)
        } else if (type === 'sex') {
            copy = await [...originalData?.sex ?? []]
            await setSex_settingT(copy)
        } else if (type === 'level') {
            copy = await [...originalData?.level ?? []]
            await setLevel_settingT(copy)
        }
        return;
    }

    async function check_data() {
        // regCheck - 기본값 true / 중복클릭 시 서식에 맞으면 true / 중복 클릭 시 서식 틀리면 false  / 중복 확인 후 사용확정시 true /false이면 잡아야함
        // overlappingCheck - 기본값 true / 데이터 변경시 false / 사용 확정시 true /  false이면 잡아야함
        // 기존값이 현재값이랑 같다면 overlappingResult 는 false여야함 / 기존값과 현재값이 다르다면 overlappingResult 는 true여야함
        // 위 overlappingResult 는 기본값은 false / 중복 확인 후 사용확정시 true /  
        if (await !regCheckName || !overlappingCheckName_settingT || (originalData?.name === name_settingT) === overlappingResult_settingT[0]) {
            return await alert('팀 이름 입력 오류 -\n원하시는 팀 이름을 입력 후 \n중복여부 확인 바랍니다.')

        }
        if (await !regCheckUrl || !overlappingCheckUrl_settingT || (originalData?.url === url_settingT) === overlappingResult_settingT[1]) {
            return await alert('팀 url 입력 오류 -\n원하시는 url 이름을 입력 후 \n중복여부 확인 바랍니다.')

        }
        if (await !day_settingT?.includes(true)) {
            return await alert('활동 요일 입력 오류 -\n하나 이상의 요일을 선택해야합니다.')
        }
        if (await !time_settingT?.includes(true)) {
            return await alert('활동 시간대 입력 오류 -\n하나의 시간대를 선택해야합니다.')
        }
        if (await area_settingT?.length < 1) {
            return await alert('활동 지역 입력 오류 -\n2글자 이상 입력바랍니다.')
        }
        if (await stadium_settingT?.length < 1) {
            return await alert('주된 사용 경기장 입력 오류 -\n2글자 이상 입력바랍니다.')
        }
        if (await !age_settingT?.includes(true)) {
            return await alert('모집 나이대 입력 오류 -\n하나 이상의 나이대를 선택해야합니다.')
        }
        if (await !sex_settingT?.includes(true)) {
            return await alert('모집 성별 입력 오류 -\n하나 이상의 성별을 선택해야합니다.')
        }
        if (await !level_settingT?.includes(true)) {
            return await alert('모집 실력 입력 오류 -\n하나의 실력을 선택해야합니다.')
        }
        await submit_settingT()
    }

    async function submit_settingT() {
        fetch('/api/post/teamadmin/update/' + id, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                name: name_settingT,
                url: url_settingT,
                day: day_settingT,
                time: time_settingT,
                area: area_settingT,
                stadium: stadium_settingT,
                age: age_settingT,
                sex: setAge_settingT,
                level: level_settingT
            })
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
                navigate(`/teampost/${url_settingT}/admin`)
                return;
            } else {
                console.log(res)
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    return (
        <div className="Teampostadminsetting-wrap">
            {!loading && (<><LoadingBar /><LoadingDot /></>)}
            {loading && (<>
                <div className='space'></div>
                <div className='Teampostadminsetting-section'>
                    <div className='Teampostadminsetting-setting'>
                        <div className='setting-title'>
                            <div className='setting-title-l'>
                                <p>팀 이름</p>
                                <div className='reset'>
                                    <p className='pointer' onClick={() => {
                                        reset_data('name')
                                    }}>원래대로</p>
                                </div>
                            </div>
                            <div className='setting-title-r'>
                                <p className='red-warning'>
                                    {!regCheckName && '한글 2 ~ 8글자'}
                                </p>
                                {!overlappingCheckName_settingT && (
                                    <p className='overlappingchecktext'
                                        onClick={() => { overlapping_check(1) }}>
                                        중복확인하기</p>
                                )}
                                {overlappingResult_settingT[0] && (
                                    <p className='overlappingdecisiontext pointer'
                                        onClick={() => {
                                            again_data(1)
                                        }}>
                                        다시 변경하기
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className='setting-body'>
                            <input name='name' type='text' value={name_settingT}
                                onChange={(e) => {
                                    setName_settingT(e.target.value)
                                    setOverlappingCheckName_settingT(false)
                                }}
                                disabled={overlappingResult_settingT[0]}
                                className={!regCheckName ? "warning" : ""}
                                maxLength={10}
                                autoComplete='off'
                            ></input>
                        </div>
                    </div>
                    <div className='Teampostadminsetting-setting'>
                        <div className='setting-title'>
                            <div className='setting-title-l'>
                                <p>팀 url</p>
                                <div className='reset'>
                                    <p className='pointer' onClick={() => {
                                        reset_data('url')
                                    }}>원래대로</p>
                                </div>
                            </div>
                            <div className='setting-title-r'>
                                <p className='red-warning'>{!regCheckUrl && '영어 / 숫자 2 ~ 10글자 (첫글자는 영어)'}</p>
                                {!overlappingCheckUrl_settingT && (
                                    <p className='overlappingchecktext'
                                        onClick={() => { overlapping_check(2) }}>
                                        중복확인하기
                                    </p>
                                )}
                                {overlappingResult_settingT[1] && (
                                    <p className='overlappingdecisiontext pointer'
                                        onClick={() => {
                                            again_data(2)
                                        }}>
                                        다시 변경하기
                                    </p>
                                )}
                            </div>

                        </div>
                        <div className='setting-body'>
                            <input name='name' type='text' value={url_settingT}
                                onChange={(e) => {
                                    setUrl_settingT(e.target.value)
                                    setOverlappingCheckUrl_settingT(false)
                                }}
                                style={{ textTransform: "lowercase" }}
                                disabled={overlappingResult_settingT[1]}
                                className={!regCheckUrl ? "warning" : ""}
                                maxLength={12}
                                autoComplete='off'
                            ></input>
                        </div>
                    </div>
                </div >
                <div className='Teampostadminsetting-section'>
                    <div className='Teampostadminsetting-setting'>
                        <div className='setting-title'>
                            <div>
                                <p>활동 요일 (중복 가능)</p>
                                <div className='reset'>
                                    <p className='pointer' onClick={() => {
                                        reset_data('day')
                                    }}>원래대로</p>
                                </div>
                            </div>
                        </div>
                        <div className="setting-body select">
                            {['월', '화', '수', '목', '금', '토', '일'].map((val, idx) => {
                                var copy = [...day_settingT]
                                return <div key={idx}
                                    onClick={async () => {
                                        copy[idx] = await !copy[idx]
                                        await setDay_settingT(copy)
                                        return
                                    }}
                                    className={day_settingT[idx] ? "choose select-box" : "select-box"}
                                ><p>{val}요일</p></div>
                            })}
                        </div>
                    </div>
                    <div className='Teampostadminsetting-setting'>
                        <div className='setting-title'>
                            <div>
                                <p>활동 시간대 (중복 불가)</p>
                                <div className='reset'>
                                    <p className='pointer' onClick={() => {
                                        reset_data('time')
                                    }}>원래대로</p>
                                </div>
                            </div>
                        </div>
                        <div className="setting-body select">
                            {['06시~10시 : 아침', "10시~18시 :  낮 ", '18시~24시 : 저녁', '24시~06시 : 심야'].map((val, idx) => {
                                var copy = [...time_settingT]
                                return <div key={idx}
                                    onClick={() => {
                                        if (time_settingT[idx]) {
                                            copy[idx] = !copy[idx]
                                        } else {
                                            copy = copy.map((v, i) => i === idx ? true : false)
                                        }
                                        setTime_settingT(copy)
                                    }}
                                    className={time_settingT[idx] ? "choose select-box" : "select-box"}
                                ><p>{val}</p></div>
                            })}
                        </div>
                    </div>
                </div>
                <div className='Teampostadminsetting-section'>
                    <div className='Teampostadminsetting-setting'>
                        <div className='setting-title'>
                            <div>
                                <p>활동지역 [ex)경기도 구리시]</p>
                                <div className='reset'>
                                    <p className='pointer' onClick={() => {
                                        reset_data('area')
                                    }}>원래대로</p>
                                </div>
                            </div>
                        </div>
                        <div className='setting-body'>
                            <input name='name' type='text' value={area_settingT}
                                onChange={(e) => {
                                    setArea_settingT(e.target.value)
                                }}
                                autoComplete='off'
                            ></input>
                        </div>
                    </div>
                    <div className='Teampostadminsetting-setting'>
                        <div className='setting-title'>
                            <div>
                                <p>주된 사용 경기장</p>
                                <div className='reset'>
                                    <p className='pointer' onClick={() => {
                                        reset_data('stadium')
                                    }}>원래대로</p>
                                </div>
                            </div>
                        </div>
                        <div className='setting-body'>
                            <input name='name' type='text' value={stadium_settingT}
                                onChange={(e) => {
                                    setStadium_settingT(e.target.value)
                                }}
                                autoComplete='off'
                            ></input>
                        </div>
                    </div>
                </div>
                <div className='Teampostadminsetting-section'>
                    <div className='Teampostadminsetting-setting'>
                        <div className='setting-title'>
                            <div>
                                <p>모집 나이대 (중복가능)</p>
                                <div className='reset'>
                                    <p className='pointer' onClick={() => {
                                        reset_data('age')
                                    }}>원래대로</p>
                                </div>
                            </div>
                        </div>
                        <div className="setting-body select">
                            {['10대', '20대', '30대', '40대', '50대이상'].map((val, idx) => {
                                var copy = [...age_settingT]
                                return <div key={idx}
                                    onClick={() => {
                                        copy[idx] = !copy[idx]
                                        setAge_settingT(copy)
                                    }}
                                    className={age_settingT[idx] ? "choose select-box" : "select-box"}>
                                    <p>{val}</p></div>
                            })}
                        </div>
                    </div>
                    <div className='Teampostadminsetting-setting'>
                        <div className='setting-title'>
                            <div>
                                <p>모집 성별 (중복가능)</p>
                                <div className='reset'>
                                    <p className='pointer' onClick={() => {
                                        reset_data('sex')
                                    }}>원래대로</p>
                                </div>
                            </div>
                        </div>
                        <div className="setting-body select">
                            {['남성', '여성'].map((val, idx) => {
                                var copy = [...sex_settingT]
                                return <div key={idx}
                                    onClick={() => {
                                        copy[idx] = !copy[idx]
                                        setSex_settingT(copy)
                                    }}
                                    className={sex_settingT[idx] ? "choose select-box" : "select-box"}
                                ><p>{val}</p></div>
                            })}

                        </div>
                    </div>
                    <div className='Teampostadminsetting-setting'>
                        <div className='setting-title'>
                            <div>
                                <p>모집 실력 (중복불가)</p>
                                <div className='reset'>
                                    <p className='pointer' onClick={() => {
                                        reset_data('level')
                                    }}>원래대로</p>
                                </div>
                            </div>
                        </div>
                        <div className="setting-body select">
                            {['사회인 4부', '사회인 3부', '사회인 2부', '사회인 1부', '취미 수준'].map((val, idx) => {
                                var copy = [...level_settingT]
                                return <div
                                    key={idx}
                                    onClick={() => {
                                        if (level_settingT[idx]) {
                                            copy[idx] = false
                                        } else {
                                            copy = copy.map((v, i) => i === idx ? true : false)
                                        }
                                        setLevel_settingT(copy)
                                    }}
                                    className={level_settingT[idx] ? "choose select-box" : "select-box"}
                                ><p>{val}</p></div>
                            })}
                        </div>
                    </div>
                    <div className='Teampostadminsetting-button'>
                        <button
                            className='pointer'
                            onClick={() => {
                                check_data()
                            }}
                        >수정</button>
                        <button
                            className='pointer'
                            onClick={() => {
                                navigate(`/teampost/${originalData?.url}/admin`)
                            }}>취소</button>
                    </div>
                </div>


                {
                    overlappingModal && (
                        <div className='modal'>
                            <div className='modalteam-setting'>
                                <div className='modalteam-setting-title'>
                                    <h5>
                                        {name_settingT}은 사용하실 수 있습니다.</h5>
                                </div>
                                <div className='modalteam-setting-body'>
                                    <p>{name_settingT} 사용하시겠습니까?</p>
                                    <p><span className='red-warning'>(최종 수정완료를 해야 변경됩니다.)</span></p>
                                </div>
                                <div className='modalteam-setting-button'>
                                    <button
                                        className='pointer'
                                        onClick={() => { overlapping_decision() }}
                                    >사용</button>
                                    <button
                                        className='pointer'
                                        onClick={() => { setOverlappingModal(false) }}>취소</button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </>)}
        </div >
    )
}

function Teampostadminmember() {
    const { id } = useParams();
    const navigate = useNavigate()

    const [loading, setLoading] = useState<boolean>(false)

    const [reHttp, setReHttp] = useState<boolean>(false)
    const [postdata, setPostdata] = useState<Postdata_team | undefined>()
    const [originMemberdata, setOriginMemberdata] = useState<Memberdata_team[] | undefined>()
    const [memberdata, setMemberdata] = useState<Memberdata_team[] | undefined>()

    const [waitPeople_adminM, setWaitPeople_adminM] = useState<number>(0)
    const [activePeople_adminM, setActivePeople_adminM] = useState<boolean>(false)
    // 가입 신청 대기인원 / originmemberdata 상 - rating 4인 대상들 
    const [modal_adminM, setModal_adminM] = useState<boolean>(false)
    // modal false = off / ture = on(검색 및 정렬) 
    const [filterApplication_adminM, setFilterApplication_adminM] = useState<boolean>(false)
    // 기본값 false -핕터 적용 안된거 /  true 필터 적용 된거 
    const [filterType_adminM, setFilterType_adminM] = useState<boolean>(true)
    // 기본값 true = 정렬필터 체크박스 / false = 검색필터 체크박스
    const [filterSort_adminM, setFilterSort_adminM] = useState<number[]>([0, 1])
    // [0] = 1등급,2가입일,3닉네임  [1] = 1내림차순 ,2오름차순
    const filterSortOption: string[][] = [['', '회원등급', '가입일', '닉네임'], ['', '오름', '내림']]
    const [filterText, setFilterText] = useState<string>('검색 및 정렬')
    const [filterSearch_adminM, setFilterSearch_adminM] = useState<string>("")

    useEffect(() => {
        fetch('/api/post/teamadmin/member/' + id, {
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
                await setOriginMemberdata(res.member_data)
                await data_coversion_adminM(res.member_data)
                await setLoading(true)
                return;
            } else {
                if (res.false_code === 4) {
                    alert('잘못된 접근입니다.')
                    navigate('/board/team')
                    return
                }
                if (res.false_code === 5) {
                    alert('잘못된 접근입니다.')
                    navigate('/teampost/' + id)
                    return
                }
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [reHttp])

    async function data_coversion_adminM(team_data: Memberdata_team[]) {
        var wait_people: number = 0;
        var currentMember: Memberdata_team[] | null = []

        await team_data.forEach((val, idx) => {
            if (val.member_rating === 4) wait_people++
            if (val.member_rating < 4 && val.member_rating > 0) currentMember?.push(val)
        })

        await setMemberdata(currentMember)
        await setWaitPeople_adminM(wait_people)
        return
    }

    async function filter_waitpeople_adminM() {
        if (waitPeople_adminM === 0) return alert('신청 대기중인 인원이 없습니다.')
        var currentMember: Memberdata_team[] | null = await []
        if (activePeople_adminM) {
            await originMemberdata?.forEach((val, idx) => {
                if (val.member_rating < 4 && val.member_rating > 0) currentMember?.push(val)
            })
            await setMemberdata(currentMember)
            return setActivePeople_adminM(!activePeople_adminM)
        } else {
            await originMemberdata?.forEach((val, idx) => {
                if (val.member_rating === 4) currentMember?.push(val)
            })
            await setMemberdata(currentMember)
            setActivePeople_adminM(!activePeople_adminM)
        }
    }

    async function filter_change(e: ChangeEvent<HTMLSelectElement>, filter_num: number) {
        var copy = [...filterSort_adminM]
        const select_value = await Number(e.target.value)
        const num = await filter_num
        copy[num] = await select_value
        await setFilterSort_adminM(copy)
        return
    }

    async function filter_application() {
        await setFilterApplication_adminM(true) // 필터가 활성화 
        if (filterType_adminM) { // filterType_adminM true 면 정렬필터
            if (filterSort_adminM[0] === 0) return alert('정렬기준을 설정해주세요')
            const filter_work = await filter_data(true)
            setFilterText(`${filterSortOption[0][filterSort_adminM[0]]} : ${filterSortOption[1][filterSort_adminM[1]]}`)
        } else { // filterType_adminM 면 검색필터
            setFilterText(`닉네임 : ${filterSearch_adminM}`)
            const filter_work = await filter_data(false)
        }
        return
    }

    async function filter_data(type: boolean) {
        // type ture -> 정렬필터  / false -> 검색필터
        if (memberdata === undefined || originMemberdata === undefined) return console.log('문제있다')
        var copy = await [...memberdata]
        if (type) {
            await copy.sort((a, b) => {
                let result;
                if (filterSort_adminM[0] === 1) {
                    result = a.member_rating - b.member_rating
                } else if (filterSort_adminM[0] === 2) {
                    result = moment(a.join_date).diff(moment(b.join_date))
                } else {
                    result = a.nickname.localeCompare(b.nickname)
                }
                return filterSort_adminM[1] === 1 ? result : -result
            })
        } else {
            const filterSearch_trim = filterSearch_adminM.trim();
            console.log(filterSearch_trim)
            copy = await originMemberdata.filter((val, idx) => {
                return val.nickname.includes(filterSearch_adminM)
            })
        }
        await setMemberdata(copy)
        return
    }

    async function filter_reset() {
        if (memberdata === undefined || originMemberdata === undefined) return console.log('문제있다')
        var copy = await [...memberdata]
        var copy1 = await [...filterSort_adminM]
        copy = await [...originMemberdata]
        await setFilterSort_adminM([0, 1])
        await setMemberdata(copy) // 데이터 원래 돌리고..
        await setModal_adminM(false) // 모달 끄고...
        await setFilterApplication_adminM(false) // 필터적용은 뺴고...
        await setFilterType_adminM(true) // 필터 기본값 돌리고..
        await setFilterText('검색 및 정렬')
        return
    }


    async function propsChangeCheck() {
        setActivePeople_adminM(false)
        return setReHttp(!reHttp)
    }

    return (
        <div className="Teampostadminmember-wrap">
            {!loading && (<><LoadingBar /><LoadingDot /></>)}
            {loading && (<>
                <div className='space'></div>
                <div className='teampostadminmember-option'>
                    <div
                        className={filterApplication_adminM ? 'option-box select pointer' : 'option-box pointer'}
                        onClick={() => { setModal_adminM(true) }}
                    >
                        <p>{filterText}</p>
                    </div>
                    <div
                        className={activePeople_adminM ? 'option-box select pointer' : 'option-box pointer'}
                        onClick={() => { filter_waitpeople_adminM() }}
                    >
                        <p>신청대기</p>
                        <div>{waitPeople_adminM}</div>
                    </div>
                </div>
                <div className='teampostadminmember-body'>
                    {memberdata?.map((val, idx) => {
                        return (
                            <Teampostadminmember_div memberdata={val} key={idx} changeCheck={propsChangeCheck} />
                        )
                    })}

                </div>

                {modal_adminM && (
                    <div className='modal'>
                        {/* 옵션과 관리  */}
                        <div className="modalteam-member">
                            <div className='modalteam-member-option'>
                                <div className='modalteam-member-title'>
                                    <h5>검색 및 정렬</h5>
                                </div>
                                <div className='modalteam-member-body'>
                                    <div className='modalteam-member-option1'>
                                        <div className='option-title'>
                                            <input
                                                type='checkbox'
                                                name='sort-filter'
                                                checked={filterType_adminM}
                                                onChange={() => {
                                                    setFilterType_adminM(!filterType_adminM)
                                                }}
                                            />
                                            <p>정렬 필터</p>
                                        </div>
                                        <div className={filterType_adminM ? 'option-body' : 'option-body disable-body'} >
                                            <div>
                                                <select onChange={(e) => {
                                                    filter_change(e, 0)
                                                }}
                                                    defaultValue={0}
                                                >
                                                    <option value={0} disabled>정렬기준</option>
                                                    <option value={1}>회원등급</option>
                                                    <option value={2}>가입일</option>
                                                    <option value={3}>닉네임</option>
                                                </select>
                                                <select onChange={(e) => {
                                                    filter_change(e, 1)
                                                }}
                                                    defaultValue={filterSort_adminM[1]}
                                                >
                                                    <option value={1}>오름차순</option>
                                                    <option value={2}>내림차순</option>
                                                </select>
                                            </div>
                                            <button className='pointer'
                                                onClick={() => {
                                                    filter_application()
                                                }}
                                            >정렬</button>
                                        </div>
                                    </div>
                                    <div className='modalteam-member-option2'>
                                        <div className='option-title'>
                                            <input
                                                type='checkbox'
                                                name='search-filter'
                                                checked={!filterType_adminM}
                                                onChange={() => {
                                                    setFilterType_adminM(!filterType_adminM)
                                                }} />
                                            <p>검색</p>
                                        </div>
                                        <div className={!filterType_adminM ? 'option-body' : 'option-body disable-body'} >
                                            <div>
                                                <select>
                                                    <option>닉네임</option>
                                                </select>
                                                <input type='text'
                                                    maxLength={8}
                                                    autoComplete='off'
                                                    onChange={(e) => {
                                                        setFilterSearch_adminM(e.target.value)
                                                    }}
                                                />
                                            </div>
                                            <button className='pointer'
                                                onClick={() => {
                                                    filter_application()
                                                }}
                                            >검색</button>
                                        </div>
                                    </div>
                                </div>
                                <div className='modalteam-member-button'>
                                    <button className='pointer'
                                        onClick={() => { filter_reset() }}
                                    >리셋</button>
                                    <button className='pointer'
                                        onClick={() => { setModal_adminM(false) }}
                                    >나가기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>)}
        </div>
    )
}

function Teampostadminmember_div(props: Memberdata_team_props) {
    const { id } = useParams();
    const { memberdata, changeCheck } = props;

    const [modal_adminM, setModal_adminM] = useState<boolean>(false)
    const [changeRating, setChangeRating] = useState<number>(0)
    const [withdrawal, setWithdrawal] = useState<boolean>(false)
    // 강제탈퇴 누르면 true 되면서 아이디 입력하라고 뜸,
    // 거기서 다시한번 누르면 true 및 아이디 동일 확인 후 탈퇴 절차 진행

    async function submit_join_management_adminM(decision: boolean) {
        // decision = true 가입수락  / false 가입 거절
        fetch('/api/post/teamamin/member/decision/join/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                decision: decision,
                user_id: memberdata?.user_id,
                member_id: memberdata?._id
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
                await changeCheck()
                await setModal_adminM(false)
                return;
            } else {
                console.log(res)
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    async function submit_rating_management_adminM() {
        // changRating = 0 선택안한검 / 2는 부팀장으로 / 3은 팀원으로  
        if (changeRating === 0) return alert('등급을 선택하셔야합니다.')
        if (memberdata?.member_rating === changeRating) return console.log('문제있다.')
        fetch('/api/post/teamamin/member/decision/rating/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                member_id: memberdata?._id,
                user_id: memberdata?.user_id,
                team_id: memberdata?.team_id,
                change_rating: changeRating
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
                await changeCheck()
                await setModal_adminM(false)
                return;
            } else {
                console.log(res)
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    async function submit_withdrawal_management_adminM() {
        if (!withdrawal) {
            setWithdrawal(true)
            return alert(`${memberdata?.nickname}회원을 탈퇴 시키려면 다시 한번 탈퇴버튼을 눌러주세요.`)
        }
        fetch('/api/post/teamamin/member/decision/withdrawal/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                member_id: memberdata?._id,
                user_id: memberdata?.user_id,
                team_id: memberdata?.team_id,
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
                await changeCheck()
                await setModal_adminM(false)
                await setWithdrawal(false)
                return;
            } else {
                console.log(res)
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    var rating_text = ["", "팀장", "부팀장", "팀원", "가입대기"]
    var member_text = `${rating_text[memberdata?.member_rating ?? 0]}`

    return (
        <div className='member-box'>
            <div className='member-box-l'>
                <div className='member-box-l-top'>
                    <h6>
                        {memberdata?.nickname}
                        {memberdata?.member_rating === 4 && (<span className='red-warning'> -신청대기</span>)}
                    </h6>
                </div>
                <div className='member-box-l-bottom'>
                    <p>{member_text}</p>
                    <p> ㆍ </p>
                    {memberdata?.member_rating === 4 ?
                        <p>신청일 : {memberdata?.application_date}</p>
                        :
                        <p>가입일 : {memberdata?.join_date}</p>
                    }

                </div>
            </div>
            <div className='member-box-r'>
                {memberdata?.member_rating !== 1 && (
                    <div className='pointer'
                        onClick={() => {
                            setModal_adminM(true)
                        }}>
                        <p>관리</p>
                    </div>
                )}
            </div>
            {modal_adminM && (
                <div className='modal'>
                    <div className="modalteam-member">
                        <div className='modalteam-member-management'>
                            <div className='modalteam-member-title'>
                                <h5>회원 관리</h5>
                            </div>
                            <div className='modalteam-member-body'>
                                {memberdata?.member_rating === 4 ?
                                    <div className='modalteam-member-management1'>
                                        <div className='management-title'>
                                            <p>신청 관리</p>
                                        </div>
                                        <div className='management-body'>
                                            <p> 회원 가입신청을 수락 하시겠습니까?</p>
                                            <div>
                                                <button className='pointer'
                                                    onClick={() => {
                                                        submit_join_management_adminM(true)
                                                    }}
                                                >수락</button>
                                                <button className='pointer'
                                                    onClick={() => {
                                                        submit_join_management_adminM(false)
                                                    }}
                                                >거절</button>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <>
                                        <div className='modalteam-member-management2'>
                                            <div className='management-title'>
                                                <p>등급 관리</p>
                                            </div>
                                            <div className='management-body'>
                                                <div>
                                                    <p>
                                                        <select
                                                            defaultValue={0}
                                                            onChange={(e) => {
                                                                setChangeRating(Number(e.target.value))
                                                            }}>
                                                            <option value={0}>-</option>
                                                            {['부팀장', '팀원'].map((val, idx) => {
                                                                if (memberdata?.member_rating === 2 && idx === 1) {
                                                                    return <option key={idx} value={3}>{val}</option>
                                                                } else if (memberdata?.member_rating === 3 && idx === 0) {
                                                                    return <option key={idx} value={2}>{val}</option>
                                                                }
                                                            })}
                                                        </select>
                                                        으로 등급변경을 하시겠습니까?</p>
                                                </div>
                                                <button className='pointer'
                                                    onClick={() => { submit_rating_management_adminM() }}
                                                >수락</button>
                                            </div>
                                        </div>
                                        <div className='modalteam-member-management2'>
                                            <div className='management-title'>
                                                <p>강제 탈퇴</p>
                                            </div>
                                            <div className='management-body'>
                                                <p> 해당 회원을 강제 탈퇴 시키겠습니까?</p>
                                                <button
                                                    className={withdrawal ? 'withdrawal pointer' : 'pointer'}
                                                    onClick={() => {
                                                        submit_withdrawal_management_adminM()
                                                    }}
                                                >
                                                    {withdrawal ? "강제탈퇴 확인" : "강제탈퇴"}
                                                </button>
                                            </div>
                                        </div>
                                    </>}
                            </div>
                            <div className='modalteam-member-button'>
                                <button className='pointer'
                                    onClick={() => {
                                        setModal_adminM(false)
                                        setWithdrawal(false)
                                    }}
                                >나가기</button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    )
}

export { Teampostadmin, Teampostadminsetting, Teampostadminmember }