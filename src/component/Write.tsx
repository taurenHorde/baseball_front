
import { useEffect, useState } from 'react'
import './../css/write.css'
import moment from 'moment'
import { LoadingBar, LoadingDot } from './Nav'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react';

function Guestwrite() {
    const navigate = useNavigate()
    const textarea = useRef<HTMLTextAreaElement>(null);
    const today = moment().add(1, 'days').startOf('day')

    const [loading, setLoading] = useState<boolean>(false)
    const [content_writeG, setContent_writeG] = useState<string>("");
    const [date_writeG, setDate_writeG] = useState<string>("");
    const [time_writeG, setTime_writeG] = useState<string>("");
    const [stadium_writeG, setStadium_writeG] = useState<string>("");
    const [sex_writeG, setSex_writeG] = useState<string>("");
    const [age_writeG, setAge_writeG] = useState<number[]>([0, 0]);
    const [level_writeG, setLevel_writeG] = useState<string>("");
    const [position_writeG, setPosition_writeG] = useState<boolean[]>([false, false, false, false]);
    const [recruitment_writeG, setRecruitment_writeG] = useState<number[]>([0, 0, 0, 0]);
    const [warning_writeG, setWarning_writeG] = useState<string>("")

    useEffect(() => {
        fetch('/api/write', {
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
                await setLoading(true)
                return;
            } else {
                await alert('로그인 페이지로 이동합니다.')
                await navigate('/login')
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    function handleResizeHeight() {
        if (textarea.current !== null) {
            textarea.current.style.height = 'auto';
            textarea.current.style.height = textarea.current.scrollHeight + 'px';
        }
        return
    }

    async function position_checkbox(checked: boolean, idx: string) {
        // idx 0 ~ 3 순서대로 - 내야수,외야수,포수,투수
        var copy = await [...position_writeG]
        var copy1;
        copy[Number(idx)] = await checked;
        await setPosition_writeG(copy)

        if (!checked) {
            // false 시 인원 수 0으로 변경
            copy1 = await [...recruitment_writeG]
            copy1[Number(idx)] = await 0
            await setRecruitment_writeG(copy1)
        }
        if (checked) {
            copy1 = await [...recruitment_writeG]
            copy1[Number(idx)] = await 1
            await setRecruitment_writeG(copy1)
        }
        return
    }

    async function position_recruitment(number: string, idx: number) {
        // idx 0 ~ 3 순서대로 - 내야수,외야수,포수,투수
        var copy = await [...recruitment_writeG]
        copy[idx] = await Number(number)
        await setRecruitment_writeG(copy)
        return
    }

    async function age_select(age: string, idx: number) {
        // idx 0 : 최소나잇대 / 1 : 최대나잇대
        var copy = await [...age_writeG]
        copy[idx] = await Number(age)
        if (idx === 0 && copy[0] > copy[1]) {
            copy[1] = await Number(age)
        }
        await setAge_writeG(copy)
        return
    }

    async function sex_select(sex: string) {
        setSex_writeG(sex)
        setLevel_writeG("")
    }

    async function summit_checkdata() {
        if (content_writeG.length < 2) return setWarning_writeG('모집 내용을 2글자 이상 입력해주세요.')
        if (!date_writeG) return setWarning_writeG('경기 날짜를 입력해주세요.')
        if (moment(date_writeG).isBefore(today)) return setWarning_writeG('경기 날짜는 오늘 이후로 입력해주세요.')
        if (!time_writeG) return setWarning_writeG('경기 시간을 입력해주세요.')
        if (!stadium_writeG) return setWarning_writeG('경기 장소를 입력해주세요.')
        if (!sex_writeG) return setWarning_writeG('성별을 입력해주세요.')
        if (age_writeG[0] === 0 || age_writeG[1] === 0) return setWarning_writeG('나이 설정을 입력해주세요.')
        if (!level_writeG) return setWarning_writeG('실력 설정을 입력해주세요.')
        if (!position_writeG.some(val => val === true)) return setWarning_writeG('모집인원 설정을 입력해주세요.')
        await setWarning_writeG("")
        await submit_writeG()
        return
    }

    async function submit_writeG() {
        fetch('/api/write/guest', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                content: content_writeG,
                date: date_writeG,
                time: time_writeG,
                stadium: stadium_writeG,
                sex: sex_writeG,
                age: age_writeG,
                level: level_writeG,
                position: position_writeG,
                recruitment: recruitment_writeG
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
                await navigate('/board')
                return;
            } else {
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    return (
        <div className='Guestwrite-Wrap'>
            <div className='pd20'>
                <div className='guestwrite-info'>
                    <h5>게스트 모집 주의사항</h5>
                    <p> 게스트 모집 특성상 등록 이후엔 수정 및 삭제가 불가능 하며, 수정 사항이 있을 시 모집 종료 후 새로 게스트 모집을 통해 모집을 해야 합니다.</p>
                </div>
                {!loading && (<><LoadingBar /><LoadingDot /></>)}
                {loading && (<>
                    <div className='guestwrite-form'>
                        <div className='guestwrite-body'>
                            <textarea
                                placeholder='특별히 알리고자 하는 내용을 간략하게 입력해 주세요.'
                                onChange={(e) => {
                                    setContent_writeG(e.target.value)
                                    handleResizeHeight()
                                    return;
                                }}
                                ref={textarea}
                                rows={1}
                            />
                        </div>
                        <div className='guestwrite-footer'>
                            <div className='footer-section mediaquery'>
                                <h6>시간 및 장소</h6>
                                <div>
                                    <input type="date" name="date" onChange={(e) => {
                                        setDate_writeG(e.target.value)
                                    }} />
                                    <input type="time" name="time" onChange={(e) => {
                                        setTime_writeG(e.target.value)
                                    }} />
                                    <select name="stadium" defaultValue={""} onChange={(e) => {
                                        setStadium_writeG(e.target.value)
                                    }}>
                                        <option value={""} disabled hidden> 경기장을 선택해주세요</option>
                                        {stadium.map((val: string, idx: number) => {
                                            return (
                                                <option value={val} key={idx}> {val} </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className='footer-section'>
                                <h6>성별</h6>
                                <div>
                                    <select name="stadium" defaultValue={""} onChange={(e) => {
                                        sex_select(e.target.value)
                                    }}>
                                        <option value={""} disabled hidden> 성별을 선택해주세요</option>
                                        <option value={'남자'}>남성만</option>
                                        <option value={'여자'}>여성만</option>
                                        <option value={'남녀'}>남성&여성</option>
                                    </select>
                                    {sex_writeG === '여자' &&
                                        <p className='red-warning'>취미 수준 ~ 3부 수준까지 선택 가능</p>
                                    }
                                    {sex_writeG === '남녀' &&
                                        <p className='red-warning'>취미 수준만 선택 가능</p>
                                    }
                                </div>
                            </div>
                            <div className='footer-section'>
                                <h6>나이</h6>
                                <div>
                                    <select name="stadium" defaultValue={""} onChange={(e) => {
                                        age_select(e.target.value, 0)
                                    }}>
                                        <option value={""} disabled hidden> - </option>
                                        {[10, 20, 30, 40, 50].map((val: number, idx: number) => {
                                            if (idx <= 3) return <option value={val} key={idx}> {val} 대</option>
                                            if (idx === 4) return <option value={val} key={idx}> {val} 대 이상</option>
                                            return <></>;
                                        })}

                                    </select>
                                    <h6> ~ </h6>
                                    <select
                                        name="stadium"
                                        value={age_writeG[1]}
                                        onChange={(e) => {
                                            age_select(e.target.value, 1)
                                        }}
                                        disabled={age_writeG[0] === 0}
                                    >
                                        <option value={0} disabled hidden> - </option>
                                        {[10, 20, 30, 40, 50].map((val: number, idx: number) => {
                                            if (age_writeG[0] <= val) {
                                                if (idx <= 3) return <option value={val} key={idx}> {val} 대</option>
                                                if (idx === 4) return <option value={val} key={idx}> {val} 대 이상</option>
                                            }
                                            return <></>;
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className='footer-section'>
                                <h6>팀의 실력</h6>
                                <div>
                                    <select
                                        name="stadium"
                                        value={level_writeG}
                                        onChange={(e) => {
                                            setLevel_writeG(e.target.value)
                                        }}>
                                        <option value={""} disabled hidden> 경기레벨을 선택해주세요</option>
                                        {['취미', '4부', '3부', '2부', '1부'].map((val: string, idx: number) => {
                                            if (sex_writeG === "남녀" && idx === 0) return <option value={val} key={idx}>{val} 수준</option>
                                            if (sex_writeG === "여자" && idx <= 2) return <option value={val} key={idx}>{val} 수준</option>
                                            if (sex_writeG === "남자") return <option value={val} key={idx}>{val} 수준</option>
                                            return <></>;
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className='footer-section'>
                                <h6>모집인원</h6>
                                <div className='felx-column Personnel'>
                                    {['내야수', '외야수', '포수', '투수'].map((val: string, idx: number) => {
                                        return (
                                            <div key={idx}>
                                                <input type='checkbox' data-position={idx} onChange={(e) => {
                                                    if (e.target.dataset.position) {
                                                        position_checkbox(e.target.checked, e.target.dataset.position)
                                                    }
                                                }} />
                                                <p>{val}</p>

                                                {position_writeG[idx] && <>
                                                    <select name="stadium" defaultValue={""} onChange={(e) => {
                                                        position_recruitment(e.target.value, idx)
                                                    }}>
                                                        <option value={'1'}>1명</option>
                                                        <option value={'2'}>2명</option>
                                                        {idx < 2 && <>
                                                            <option value={'3'}>3명</option>
                                                            <option value={'4'}>4명</option>
                                                        </>}
                                                    </select>
                                                </>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className='guestwrite-button'>
                            <div>
                                <p>{warning_writeG}</p>
                            </div>
                            <button className='pointer' onClick={summit_checkdata}> 작성하기 </button>
                            <button className='pointer' onClick={() => navigate(-1)}> 뒤로가기 </button>
                        </div>
                    </div>
                </>)}
            </div>
        </div >
    )
}

function Bulletinwrite() {
    const navigate = useNavigate()
    const [classification_writeB, setClassification_writeB] = useState<number>(1);
    const [title_writeB, setTitle_writeB] = useState<string>("")
    const [content_writeB, setContent_writeB] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    // const [pictrue_writeB, setPictrue_writeB] = useState<string>("")
    // const [gameinfo_writeB, setGameinfo_writeB] = useState<string>("")

    useEffect(() => {
        fetch('/api/write', {
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
                await setLoading(true)
                return;
            } else {
                await alert('로그인 페이지로 이동합니다.')
                await navigate('/login')
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }, [])

    async function submit_checkdata(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (title_writeB.length < 2) return alert('제목을 2글자 이상 적어주세요.')
        if (content_writeB.length < 2) return alert('내용을 2글자 이상 적어주세요.')
        return submit_writeB();
    }

    async function submit_writeB() {
        fetch('/api/write/bulletin', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                classification: classification_writeB,
                title: title_writeB,
                content: content_writeB,
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
                await navigate('/board/bulletin')
                return;
            } else {
                return;
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    return (
        <div className='Bulletinwrite-Wrap'>
            <div className='pd20'>
                <div className='bulletinwrite-info'>
                    <h5> 자유게시판 글 작성시 주의사항</h5>
                    <p> 자유롭게 글을 작성해주세요. </p>
                </div>
                <div className='bulletinwrite-classification'>
                    <div
                        className={classification_writeB === 1 ? "option selected" : "option"}
                        data-number='1'
                        onClick={() => (setClassification_writeB(1))}
                    >
                        <p>자유</p>
                    </div>
                    <div
                        className={classification_writeB === 2 ? "option selected" : "option"}
                        data-number='2'
                        onClick={() => (setClassification_writeB(2))}
                    >
                        <p>후기</p>
                    </div>
                    <div
                        className={classification_writeB === 3 ? "option selected" : "option"}
                        data-number='3'
                        onClick={() => (setClassification_writeB(3))}
                    >
                        <p>질문</p>
                    </div>
                </div>
                {!loading && (<><LoadingBar /><LoadingDot /></>)}
                {loading && (<>
                    <form onSubmit={submit_checkdata}>
                        <div className='bulletinwrite-form'>
                            <div className='bulletinwrite-head'>
                                <input
                                    type='text'
                                    placeholder='제목을 입력하세요.'
                                    maxLength={30}
                                    onChange={(e) => { setTitle_writeB(e.target.value) }}
                                />
                            </div>
                            <div className='bulletinwrite-body'>
                                <textarea
                                    placeholder='페이지 상단에 있는 자유게시판 글 작성 시 주의사항을 꼭 확인해 주세요.'
                                    onChange={(e) => { setContent_writeB(e.target.value) }}
                                />
                            </div>
                            <div className='bulletinwrite-footer'>
                                {/* <div className='bulletinwrite-picture'>
                                    <div className='picture-top'>
                                        <div className='picture-l'>
                                            +
                                        </div>
                                        <div className='picture-r'>
                                            <div className='mini-picturebox'></div>
                                            <div className='mini-picturebox'></div>
                                            <div className='mini-picturebox'></div>
                                            <div className='mini-picturebox'></div>
                                            <div className='mini-picturebox'></div>
                                        </div>
                                    </div>
                                    <div className='picture-bottom'>
                                        <div>
                                            <p>ㆍ이미지 파일은 개당 20MB, 2개까지 업로드 가능합니다</p>
                                            <p>ㆍ음란물,차별,비하,혐오 및 초상권,저작권 침해 게시물은 민,형사상의 책임을 질 수 있습니다.</p>
                                        </div>
                                    </div>
                                </div> */}
                                {classification_writeB === 2 && <>
                                    {/* <div className='bulletinwrite-review'>
                                        <div className='review-select'>
                                            <p>경기 선택 : </p>
                                            <select>
                                                <option>2023-02-30 15:30 잠실야구장 내야수 출전</option>
                                                <option>2023-03-02 12:30 고척야구장 외야수 출전</option>
                                                <option>2023-03-09 15:30 대전야구장 내야수 출전</option>
                                                <option>2023-03-15 18:30 길거리야구장 내야수 출전</option>
                                                <option>2023-03-19 19:30 야구장이름이너무길면어찌하누 포수 출전</option>
                                            </select>
                                        </div>
                                        <div className='review-data'>
                                            
                                        </div>
                                        <div className='review-info'>
                                            <div>
                                                <p>ㆍ타인의 대한 비난과 혐오글은 경고없이 삭제 될 수 있습니다.</p>
                                                <p>ㆍ선택한 경기에 대한 경기정보 (경기일시,경기장소,포지션 등)은 모든 사람이 볼 수 있습니다.</p>
                                                <p>ㆍ경기결과 및 상대팀 정보는 기재되지 않습니다.</p>
                                            </div>
                                        </div>
                                    </div> */}
                                </>}
                            </div>
                            <div className='bulletinwrite-button'>
                                <button className='pointer' type='submit'> 작성하기 </button>
                                <button
                                    className='pointer'
                                    onClick={() => {
                                        navigate('/board')
                                    }}> 뒤로가기 </button>
                            </div>
                        </div>
                    </form>
                </>)}
            </div>
        </div>
    )
}


let stadium: string[] = ['잠실야구장', '고척스카이돔', '랜더스필드', '이글스파크', '엔씨파크', '라이온즈파크', '사직구장', '챔피언스필드']




export { Guestwrite, Bulletinwrite }