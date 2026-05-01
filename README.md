#### General
- [Army Links](https://armylinks.com/all-links/)

---

#### Army AVD

- [Army 365 Enterprise Azure Virtual Desktop (AVD) Onboarding](https://myaccess.microsoft.us/@armyeitaas.onmicrosoft.us#/access-packages/b0a616f3-d77c-4f2d-bbb1-5d1bb9c5d709)

- [Web client (*Direct*)](https://client.wvd.azure.us/arm/webclient/index.html) or [AVD (*Redirect*)](https://aka.ms/AVDGov) | [*Azure environments*](https://learn.microsoft.com/en-us/previous-versions/remote-desktop-client/connect-windows-cloud-services?tabs=web#tabpanel_2_web) | [*MilitaryCAC: AVD*](https://militarycac.com/avd.htm)

<details>
<summary>FreeRDP - Army AVD</summary>

## Install package
```sh
sudo pacman -S freerdp --noconfirm
```

## FreeRDP command
```sh
xfreerdp3 "Army Desktop.rdpw" /cert:ignore /smartcard +clipboard /azure:ad:login.microsoftonline.us,tenantid:common,avd-access:https%%3A%%2F%%2Flogin.microsoftonline.com%%2Fcommon%%2Foauth2%%2Fnativeclient
```
- To obtain the `Army Desktop.rdpw` file you need to use the [Web client](https://client.wvd.azure.us/arm/webclient/index.html). Once logged in, you'll see a `⚙️` icon- select that icon and modify the *Resources Launch Method* from `Open resources in the browser` to `Download the rdp file`. Now select either the Arizona or Virginia `Army Desktop` tile/button.

## Certificate Propagation?
```bat
certutil -scinfo
```

</details>

---

#### A365 Webapps
  - [Office Home](https://www.ohome.apps.mil/)
  - [Teams](https://dod.teams.microsoft.us/v2/)
  - [Outlook](https://webmail.apps.mil/mail/inbox)
  - [Excel](https://www.ohome.apps.mil/launch/excel?auth=2&username=.mil@army.mil)

---

#### Personal
  - [iPERMS RMA](https://iperms.hrc.army.mil/)
  - [IPPS-A](https://ipps-a.army.mil/)
  - [Soldier Equipping & Asset Management (SEAM)](https://tacom.army.mil/seam)
    - Missing Gear? Utilize these instead of getting a statement of charges!
      - [Venture Surplus](https://www.venturesurplus.com/shop/)
      - [Army Navy Outdoors](https://armynavyoutdoors.com/)
  - [ID Card Office Online](https://idco-pki.dmdc.osd.mil/idco/myprofile-info)
  - [Defense Travel System (DTS)](https://dtsproweb.defensetravel.osd.mil/dts-app/pubsite/all/view)
  - [Army Training and Certification Tracking System (ATCTS)](https://atcts.army.mil/)
  - [Medical Operational Data System (MODS)](https://www.mods.army.mil/MODSHome)
  - [Servicemembers Civil Relief Act (SCRA)](https://www.militaryonesource.mil/financial-legal/personal-finance/servicemembers-civil-relief-act/)

---

#### Medical
  - [MHS Genesis Patient Portal](https://my.mhsgenesis.health.mil/pages/home)
  - [MEDPROS](https://medpros.mods.army.mil/MEDPROSNew/)

---

#### Financial
  - [myPay](https://mypay.dfas.mil/#/)
  - [MyArmyBenefits](https://myarmybenefits.us.army.mil/)
  - [Thrift Savings Plan (TSP)](https://www.tsp.gov/)
  - [Defense Finance Accounting Service (DFAS)](https://www.dfas.mil/)

---

#### Deployment/Mobilization (*NIPR Required*)

- [Tour of Duty](https://mobcop.aoc.army.pentagon.mil/)

---

#### Jobs
  - [USAJOBS](https://www.usajobs.gov/)
  - [ClearanceJobs](https://www.clearancejobs.com/)

---

#### Army Publishing Directorate (APD)
  - [DA Forms Directory](https://armypubs.army.mil/default.aspx)
  - [Army Regulations](https://armypubs.army.mil/productmaps/pubform/ar.aspx)

---

#### Education
  - [ArmyIgnitED](https://armyignited.cce.af.mil/student/account/login)
    - Missing an account/can't login?
      - Email ```info@intellectualpoint.com``` or call ```703-554-3827``` that you're missing an armyignited account, and can't login with your CAC. (Make sure to mention your full name, rank, DoDID, etc.)
  - [Joint Services Transcript (JST)](https://jst.doded.mil/jst/)
    - Make sure to utilize/send your JST transcript for college credits!
  - [Army COOL](https://www.cool.osd.mil/army/index.html)
  - [GenAI](https://gemini.genai.mil/)

---

<details>
<summary>ASVAB Preperation</summary>

# Armed Services Vocational Aptitude Battery (ASVAB)

- [ASVAB Scores and Army Jobs](https://www.military.com/join-armed-forces/asvab/asvab-and-army-jobs.html)

## AFQT Scores and Trainability

| Category | Percentile Score | Trainability    |
|----------|------------------|-----------------|
| I        | 93–99            | Outstanding     |
| II       | 65–92            | Excellent       |
| III A    | 50–64            | Above average   |
| III B    | 31–49            | Average         |
| IV       | 10–30            | Below average   |
| V        | 1–9              | Not trainable   |

## Main 4 AFQT Subjects

- Word Knowledge (WK)
- Paragraph Comprehension (PC)
- Arithmetic Reasoning (AR)
- Mathematics Knowledge (MK)

## The U.S. Army’s Ten Line Scores

| Line Score                           | Standard Scores Used                                                                                                     | Formula Used              |
|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------|---------------------------|
| Clerical (CL)                        | Verbal Expression (VE), Arithmetic Reasoning (AR), and Mathematics Knowledge (MK)                                        | VE + AR + MK              |
| Combat (CO)                          | Arithmetic Reasoning (AR), Coding Speed (CS), Auto & Shop Information (AS), and Mechanical Comprehension (MC)            | AR + CS + AS + MC         |
| Electronics (EL)                     | General Science (GS), Arithmetic Reasoning (AR), Mathematics Knowledge (MK), and Electronics Information (EI)            | GS + AR + MK + EI         |
| Field Artillery (FA)                 | Arithmetic Reasoning (AR), Coding Speed (CS), Mathematics Knowledge (MK), and Mechanical Comprehension (MC)              | AR + CS + MK + MC         |
| General Maintenance (GM)             | General Science (GS), Auto & Shop Information (AS), Mathematics Knowledge (MK), and Electronics Information (EI)         | GS + AS + MK + EI         |
| General Technical (GT)               | Verbal Expression (VE) and Arithmetic Reasoning (AR)                                                                     | VE + AR                   |
| Mechanical Maintenance (MM)          | Numerical Operations (NO), Auto & Shop Information (AS), Mechanical Comprehension (MC), and Electronics Information (EI) | NO + AS + MC + EI         |
| Operators and Food (OF)              | Verbal Expression (VE), Numerical Operations (NO), Auto & Shop Information (AS), and Mechanical Comprehension (MC)       | VE + NO + AS + MC         |
| Surveillance and Communications (SC) | Verbal Expression (VE), Arithmetic Reasoning (AR), Auto & Shop Information (AS), and Mechanical Comprehension (MC)       | VE + AR + AS + MC         |
| Skilled Technical (ST)               | General Science (GS), Verbal Expression (VE), Mathematics Knowledge (MK), and Mechanical Comprehension (MC)              | GS + VE + MK + MC         |

## The ASVAB Subtests in Order

| Subtest                       | Questions/Time (CAT-ASVAB)                     | Possible Questions/Time (CAT-ASVAB)  | Questions/Time (Paper Version) | Content                                                        |
|-------------------------------|------------------------------------------------|--------------------------------------|--------------------------------|----------------------------------------------------------------|
| General Science (GS)          | 15 questions, 12 minutes                       | 30 questions, 25 minutes             | 25 questions, 11 minutes       | General principles of biological and physical sciences         |
| Arithmetic Reasoning (AR)     | 15 questions, 55 minutes                       | 30 questions, 113 minutes            | 30 questions, 36 minutes       | Word problems involving high school math concepts that require calculations |
| Word Knowledge (WK)           | 15 questions, 9 minutes                        | 30 questions, 18 minutes             | 35 questions, 11 minutes       | Correct meaning of a word; occasionally antonyms (words with opposite meanings) |
| Paragraph Comprehension (PC)  | 10 questions, 27 minutes                       | 25 questions, 75 minutes             | 15 questions, 13 minutes       | Questions based on passages (usually a couple of hundred words) that you read |
| Mathematics Knowledge (MK)    | 15 questions, 31 minutes                       | 30 questions, 65 minutes             | 25 questions, 24 minutes       | High school math, including algebra and geometry               |
| Electronics Information (EI)  | 15 questions, 10 minutes                       | 30 questions, 21 minutes             | 20 questions, 9 minutes        | Electrical principles, basic electronic circuitry, and electronic terminology |
| Auto & Shop Information (AS)  | 10 Auto Information questions, 7 minutes; 10 Shop Information questions, 7 minutes | 25 Auto Information questions, 18 minutes; 25 Shop Information questions, 17 minutes | 25 questions, 11 minutes     | Knowledge of automobiles, shop terminology, and tool use     |
| Mechanical Comprehension (MC) | 15 questions, 22 minutes                       | 30 questions, 42 minutes             | 25 questions, 19 minutes       | Basic mechanical and physical principles                       |
| Assembling Objects (AO)*      | 15 questions, 18 minutes                       | 30 questions, 38 minutes             | 25 questions, 15 minutes       | Spatial orientation                                            |

## Versions of the ASVAB

| Version                        | How You Take It                                                                 | Format                          | Purpose                                                                                                           |
|-------------------------------|---------------------------------------------------------------------------------|---------------------------------|-------------------------------------------------------------------------------------------------------------------|
| Student                       | Given to juniors and seniors in high school; administered through a cooperative program between the Department of Education and the Department of Defense at high schools across the United States | Paper                           | Its primary purpose is to provide a tool for guidance counselors to use when recommending civilian career areas to high school students (though it can be used for enlistment if taken within two years of enlistment). For example, if a student scores high in electronics, the counselor can recommend electronics career paths. If a student is interested in military service, the counselor then refers them to the local military recruiting offices. |
| Enlistment                    | Given through a military recruiter at a Military Entrance Processing Station (MEPS) or at a satellite testing site | Usually computer, may be paper | This version of the ASVAB is used by all the military branches for the purpose of enlistment qualification and to determine which military jobs a recruit can successfully be trained in. |
| Enlistment Screening Test (EST)| Given at the discretion of a military recruiter for a quick enlistment qualification screening | Computer                        | These mini-ASVABs aren’t qualification tests; they’re strictly recruiting and screening tools. The EST contains about 50 questions similar but not identical to questions on the AFQT portion of the ASVAB. The test is used to help estimate an applicant’s probability of obtaining qualifying ASVAB scores. |
| Pre-screening, internet-delivered Computerized Adaptive Test (PiCAT) | Online, on your own time after receiving an access code from your recruiter | Computer                        | The PiCAT is an unproctored, full version of the ASVAB. You take it on your own time, but you must take a verification test at a MEPS to validate your score. The verification test typically takes 25 to 30 minutes to complete. |
| Armed Forces Classification Test (AFCT) | Given at installation educational centers to people already in the military through the Defense Manpower Data Center | Computer                        | At some point during your military career, you may want to retrain for a different job. If you need higher ASVAB scores to qualify for such retraining, or if you’re a commissioned officer who wants to become a warrant officer, you can take the AFCT. The AFCT is essentially the same as the other versions of the ASVAB. |

- [ASVAB Practice Test](https://asvabpracticetestonline.com/asvab-test-sections/)
- [Sample Questions - ASVAB](https://www.officialasvab.com/applicants/sample-questions/)
- [ASVAB PRACTICE TEST](https://nationalguard.com/practice-asvab)
- [DDRPT - Quick Practice Test](https://ddrpt.com/index.php?action=quicktest)
- [Pending Internet Computerized Adaptive Test (PiCAT)](https://picat.dpac.mil)

---

### 17C (Cyber Operations Specialist) MOS Example:

| Requirement | Minimum Score | Formula Used                          |
|-------------|---------------|---------------------------------------|
| GT Score    | 110           | VE + AR                               |
| ST Score    | 112           | GS + VE + MK + MC                     |

- This means you need to focus and score well on these topics in specific:
  - GT
    - Verbal Expression (VE)
    - Arithmetic Reasoning (AR)
  - ST
    - General Science (GS)
    - Verbal Expression (VE)
    - Mathematics Knowledge (MK)
    - Mechanical Comprehension (MC)

- Information and Communication Technology Literacy (ICTL)
  - [Quizlet - ICTL TEST (CYBER TEST)](https://quizlet.com/625879191/ictl-test-cyber-test-flash-cards/)
  - [ARMY CYBER ICTL EXAM](https://www.reddit.com/r/nationalguard/comments/1d7c7j0/army_cyber_ictl_exam/)

</details>

---

#### Training / Learning
  - [learn.atis.army.mil](https://learn.atis.army.mil/moodle/)
  - [jkodirect.jten.mil](https://jkodirect.jten.mil/Atlas2/page/desktop/DesktopHome.jsf)
  - [www.lms.army.mil](https://www.lms.army.mil/)
  - [securityawareness.usalearning.gov](https://securityawareness.usalearning.gov/index.html)
    - Replacing `/index.htm` with `/quiz/story.html` in the URL skips to final assessment.

---

#### Common Acronyms Decoded

<details>
<summary>List...</summary>

| Acronym | Meaning                                                      |
|---------|--------------------------------------------------------------|
| APFU    | Army Physical Fitness Uniform                                |
| AT      | Annual Training                                              |
| CPX     | Command Post Exercises                                       |
| ETS     | Expiration Term of Service (Leave the Army)                  |
| FTX     | Field Training Exercises                                     |
| IDT     | Inactive Duty Training                                       |
| PHA     | Physical Health Assessment                                   |
| PMT     | Pre Mobilization Training                                    |
| PT      | Physical Training                                            |
| RMA     | Risk Management Assessment                                   |
| RSD     | Regular Scheduled Drill                                      |
| SRP     | Soldier Readiness Processing (PHA but for pre-deployment)    |
| SM      | Service Member(s)                                            |
| WFX     | Warfighter Exercise (Pre-deployment training)                |
| NCO     | Non-Commissioned Officer                                     |
| MOS     | Military Occupational Specialty                              |
| OPSEC   | Operational Security                                         |
| SOP     | Standard Operating Procedure                                 |
| TAD     | Temporary Additional Duty                                    |
| UA      | Unauthorized Absence                                         |
| VA      | Volunteer Army                                               |
| XO      | Executive Officer                                            |

</details>

---

#### Miscellaneous

- 🌐 Utilizing Port 53 (*DNS*) with a VPN on Public Wi-Fi
  - Connect to a VPN service, configuring it to use port 53. This disguises VPN traffic as DNS queries, bypassing login requirements on public WiFi with captive portal networks, ensuring unrestricted internet access while preserving privacy and security.

- Compact Smart Card R/W
  - [Advanced Card Systems](https://www.acs.com.hk/)
    - [‎ACR38U-N1 | Black | USB-A](https://www.amazon.com/dp/B00RPNZ3BG)
    - [‎ACR39U-N1 | White | USB-A](https://www.amazon.com/dp/B0758TS5JR)
    - [‎ACR39U-NF | White | USB-C](https://www.amazon.com/dp/B06X9NTGYV)

- Mobile Hotspot Router (Wi-Fi Puck) - Recommended for overseas deployments
  - NETGEAR
    - [Nighthawk M6 (MR6150)](https://www.amazon.com/dp/B0BGV79FHT)
      - Band Compatibility: `5G SA/NSA, 2.5 Gbps`
      - WiFi Technology: `WiFi 6`
      - Max Speed: `3.6 Gbps`
    - [Nighthawk M6 Pro (MR6550)](https://www.amazon.com/dp/B0BGV79FHT)
      - Band Compatibility: `5G mmWave, Sub-6, 8.0 Gbps`
      - WiFi Technology: `WiFi 6E`
      - Max Speed: `3.6 Gbps`

- Article 15 (UCMJ)
  - [Educational Video](https://go.screenpal.com/watch/cZhwljVNhrV)
