// team/teamData.ts

export interface TeamMember {
    id: string;
    parentId: string | null;
    name: string;
    title: string;
    image?: string;
    linkedin?: string;
    x?: string;
}

export const teamData: TeamMember[] = [
    { id: "Celesta-Team", name: "Team Celesta", title: "The Torch Bearers", parentId: null },

    // Overall Fest Coordinators
    { id: "fest-coords", name: "Overall Fest Coordinators", title: "The Chiefs", parentId: "Celesta-Team" },
    { id: "alok", name: "Alok Kumar", title: "Overall Coordinator", parentId: "fest-coords", image: "/team-images/alok.jpg", linkedin: "https://www.linkedin.com/in/alok-kumar-321362371", x: "https://www.instagram.com/_07alok07_?igsh=YTJoeWd4ZDY2NHp1" },
    { id: "aditya", name: "Aditya Arekar", title: "Overall Coordinator", parentId: "fest-coords", image: "/team-images/aditya.jpeg", linkedin: "https://www.linkedin.com/in/aditya-arekar28", x: "https://www.instagram.com/aditya_arekar_09?igsh=dTQzYmpvYzJ0djZl" },
    
    { id: "convenors", name: "Convenors", title: "The Convenors", parentId: "Celesta-Team" },
    { id: "abhitesh", name: "Abhitesh Shukla", title: "Convenors", parentId: "convenors", image: "/team-images/abhitesh.png", linkedin: "https://www.linkedin.com/in/abhitesh-shukla-bb8053294?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", x: "https://www.instagram.com/abhitesh_gargvanshi?igsh=OTViY2szdGlpd281" },
    { id: "ananta", name: "Ananta Nanda", title: "Convenors", parentId: "convenors", image: "/team-images/ananta.png", linkedin: "https://www.linkedin.com/in/anantananda?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", x: "#" },
    
    // Committees
    { id: "Committees", name: "All Committees", title: "The Performers", parentId: "Celesta-Team" },
    
    // Marketing & Sponsorship
    { id: "sponsorship", name: "Marketing & Sponsorship", title: "The Partnership Pioneers", parentId: "Committees" },
    { id: "avni", name: "Avni Shukla", title: "Coordinator", parentId: "sponsorship", image: "/team-images/avni.jpeg", linkedin: "https://www.linkedin.com/in/avni-shukla-8921b5324", x: "https://www.instagram.com/3vni.shukla" },
    { id: "kartik", name: "Kartik Sen", title: "Coordinator", parentId: "sponsorship", image: "/team-images/kartik.jpg", linkedin: "https://www.linkedin.com/in/kars13105/", x: "https://www.instagram.com/kartik._014/" },
    { id: "aryan", name: "Aryan Jajodia", title: "Coordinator", parentId: "sponsorship", image: "/team-images/aryan.jpg", linkedin: "https://www.linkedin.com/in/aryan-jajodia-2b43b5328", x: "https://www.instagram.com/aryan.jajodia" },
    { id: "yahya", name: "Yahya Dawoodi", title: "Coordinator", parentId: "sponsorship", image: "/team-images/yahya.jpg", linkedin: "https://www.linkedin.com/in/yahyadawoodi", x: "https://www.instagram.com/_yahya_116" },
    
    // MPR
    { id: "mpr", name: "MPR", title: "The Buzz Brigade", parentId: "Committees" },
    { id: "yogyansh", name: "Yogyansh Khambra", title: "Coordinator", parentId: "mpr", image: "/team-images/yogyansh.jpeg", linkedin: "https://www.linkedin.com/in/yogyansh-khambra-0baa63357", x: "https://www.instagram.com/yogyansh_khambra" },
    { id: "bighnesh", name: "Bighnesh Parida", title: "Coordinator", parentId: "mpr", image: "/team-images/bighnesh.jpg", linkedin: "https://www.linkedin.com/in/bighnesh-parida-3b4bb4317", x: "#" },
    { id: "dhairya", name: "Dhairya Garg", title: "Coordinator", parentId: "mpr", image: "/team-images/dhairya.jpg", linkedin: "https://www.linkedin.com/in/dhairya-garg-32656024b", x: "https://www.instagram.com/drunks0crates" },
    { id: "abhijeet", name: "Abhijeet S. Jadaun", title: "Coordinator", parentId: "mpr", image: "/team-images/abhijeet.jpg", linkedin: "https://www.linkedin.com/in/abhijeet-singh-jadaun-1a796525b", x: "https://www.instagram.com/abhijeet_singh_iitp_" },

     // Flagship
    { id: "flagship", name: "Flagship Events", title: "The Mainstage Mavericks", parentId: "Committees" },
    { id: "viraj", name: "Viraj Khunepimpre", title: "Coordinator", parentId: "flagship", image: "/team-images/viraj.jpg", linkedin: "https://www.linkedin.com/in/viraj-khunepimpre-707a6425a", x: "#" },
    { id: "kalpit", name: "Kalpit Chaudhary", title: "Coordinator (Robowars)", parentId: "flagship", image: "/team-images/kalpit.jpg", linkedin: "https://www.linkedin.com/in/kalpit-chaudhary-946b10271", x: "#" },
    { id: "ayushman", name: "Ayushman Kumar", title: "Coordinator", parentId: "flagship", image: "/team-images/ayushman.png", linkedin: "https://www.linkedin.com/in/ayushman-kumar-116aa7328", x: "https://www.instagram.com/ayushman_singh.01" },
    { id: "saad", name: "Saad Manda", title: "Coordinator", parentId: "flagship", image: "/team-images/saad.jpg", linkedin: "https://linkedin.com/in/saad-manda", x: "#" },
    { id: "parth", name: "Parth Agarwal", title: "Coordinator", parentId: "flagship", image: "/team-images/parth.jpg", linkedin: "https://www.linkedin.com/in/parthagarwal8910", x: "#" },
    { id: "ayush", name: "Ayush Gupta", title: "Coordinator", parentId: "flagship", image: "/team-images/ayush.jpg", linkedin: "https://www.linkedin.com/in/ayush-gupta-675549320", x: "https://www.instagram.com/mr_ayush_0907" },
    { id: "amar", name: "Amar Kumar", title: "Coordinator", parentId: "flagship", image: "/team-images/amar.jpg", linkedin: "https://www.linkedin.com/in/amar-kumar-860b17312", x: "https://www.instagram.com/amar_kr_1511" },

    // Web & App Dev
    { id: "tech", name: "Web Development", title: "The Tech Virtuosos", parentId: "Committees" },
    { id: "shivanshu", name: "Shivanshu Verma", title: "Coordinator", parentId: "tech", image: "/team-images/shivanshu.jpg", linkedin: "https://www.linkedin.com/in/shivanshu-verma-899575321", x: "https://www.instagram.com/shivanshu_0189" },
    {id: "laskhya", name:"Lakshya Kushwaha", title: "Coordinator", parentId:"tech",image:"/team-images/lakshya.jpeg", linkedin:"https://www.linkedin.com/in/lakshya-kushwaha-223316320/", x: "#"},

    // Production
    { id: "production", name: "Production", title: "The Stage Masters", parentId: "Committees" },
    { id: "riddhesh", name: "Riddhesh Dalal", title: "Coordinator", parentId: "production", image: "/team-images/riddhesh.jpg", linkedin: "https://www.linkedin.com/in/riddhesh-dalal", x: "https://www.instagram.com/rd_artist3" },
    { id: "sushanth", name: "Sushanth Reddy", title: "Coordinator", parentId: "production", image: "/team-images/sushanth.jpg", linkedin: "#", x: "https://www.instagram.com/sushanthreddyhere" },
    { id: "ayushsen", name: "Ayush Sen", title: "Coordinator", parentId: "production", image: "/team-images/ayushsen.jpg", linkedin: "https://www.linkedin.com/in/ayush-sen-b96870326", x: "#" },

    // Creative & Design
    { id: "creative", name: "Creative & Design", title: "The Visual Architects", parentId: "Committees" },
    { id: "hima", name: "Hima Sai Chandana", title: "Coordinator", parentId: "creative", image: "/team-images/hima.jpg", linkedin: "#", x: "https://www.instagram.com/himasaichandana" },
    { id: "kunal", name: "Kunal Deore", title: "Coordinator", parentId: "creative", image: "/team-images/kunal.jpeg", linkedin: "https://www.linkedin.com/in/krbd04/", x: "https://www.instagram.com/k.deore04/" },
    { id: "avi", name: "Avi Bharti", title: "Coordinator", parentId: "creative", image: "/team-images/avi.jpeg", linkedin: "https://www.linkedin.com/in/avi-bharti-029b1833b", x: "https://www.instagram.com/ave08_6/" },
    

    // Hospitality & Logistics
    { id: "hospitality", name: "Hospitality & Logistics", title: "The Ambassadors of Welcome", parentId: "Committees" },
    { id: "disha", name: "Disha Mulchandani", title: "Coordinator", parentId: "hospitality", image: "/team-images/disha.jpg", linkedin: "https://www.linkedin.com/in/disha-mulchandani-b79323321", x: "https://www.instagram.com/dishamulchandani01" },
    { id: "sanvidhan", name: "Sanvidhan Lonare", title: "Coordinator", parentId: "hospitality", image: "/team-images/sanvidhan.jpeg", linkedin: "#", x: "https://www.instagram.com/sanvidhan_09" },
    { id: "jatin", name: "Jatin Khurana", title: "Coordinator", parentId: "hospitality", image: "/team-images/jatin.jpg", linkedin: "#", x: "#" },

    // Outreach & Programs
    { id: "outreach", name: "Outreach & Programs", title: "The Network Amplifiers", parentId: "Committees" },
    { id: "ankit", name: "Ankit", title: "Coordinator", parentId: "outreach", image: "/team-images/ankit.png", linkedin: "https://www.linkedin.com/in/ankit-07-chy", x: "#" },
    { id: "varun", name: "Varun Kumar", title: "Coordinator", parentId: "outreach", image: "/team-images/varun.jpg", linkedin: "https://www.linkedin.com/in/varun-kumar-44622b329", x: "https://www.instagram.com/varun_kumar027" },
    { id: "sohom", name: "Sohom Maji", title: "Coordinator", parentId: "outreach", image: "/team-images/sohom.jpg", linkedin: "#", x: "#" },
    { id: "ayushkar", name: "Ayushkar Nath", title: "Coordinator", parentId: "outreach", image: "/team-images/ayushkar.jpg", linkedin: "https://www.linkedin.com/in/ayushkar-nath-86a46a313", x: "https://www.instagram.com/ayushkar_07" },

    // RSP
    { id: "rsp", name: "RSP", title: "The Engagement Gatekeepers", parentId: "Committees" },
    { id: "parnava", name: "Parnava Maitra", title: "Coordinator", parentId: "rsp", image: "/team-images/parnava.png", linkedin: "https://www.linkedin.com/in/parnava-maitra-84778b357", x: "https://www.instagram.com/parnava_12_maitra" },
    { id: "vidhi", name: "Vidhi Patel", title: "Coordinator", parentId: "rsp", image: "/team-images/vidhi.jpg", linkedin: "https://www.linkedin.com/in/vidhi-patel-5a1893310", x: "https://www.instagram.com/vidhi__patel__2756" },
    { id: "sushreeth", name: "G Sushreeth", title: "Coordinator", parentId: "rsp", image: "/team-images/sushreeth.jpg", linkedin: "https://in.linkedin.com/in/guruduwaru-sushreeth-b18a93326", x: "https://www.instagram.com/sushreeth_4533" },

    // Events
    { id: "events", name: "Events", title: "The Experience Engineers", parentId: "Committees" },
    { id: "purushotam", name: "Purushotam Kumar", title: "Coordinator", parentId: "events", image: "/team-images/purushotam.jpeg", linkedin: "https://www.linkedin.com/in/purushotam-kumar-73326a346", x: "https://www.instagram.com/purushotam_kumar05" },
    { id: "prasanapriyan", name: "Prasanapriyan G", title: "Coordinator", parentId: "events", image: "/team-images/prasana.jpg", linkedin: "https://www.linkedin.com/in/prasanapriyan-g-94683b312", x: "#" },
    { id: "shashi", name: "N. Shashi Raghava", title: "Coordinator", parentId: "events", image: "/team-images/shashi.jpg", linkedin: "https://www.linkedin.com/in/nune-shashi-raghava-7a4269377", x: "https://www.instagram.com/mr_dreamer77_/" },

];


// =====================
// Developers (Separate List)
// =====================

export const developersData: TeamMember[] = [
    {
        id: "dev-shivanshu",
        parentId: null,
        name: "Shivanshu Verma",
        title: "Coordinator",
        image: "/team-images/shivanshu.jpg",
        linkedin: "https://www.linkedin.com/in/shivanshu-verma-899575321",
        x: "https://www.instagram.com/shivanshu_0189",
    },
    {id: "dev-laskhya", name:"Lakshya Kushwaha", title: "Coordinator", parentId:"null",image:"/team-images/lakshya.jpeg", linkedin:"https://www.linkedin.com/in/lakshya-kushwaha-223316320/", x: "#"},
    {id: "dev-kartik", name:"Kartik Chawla ", title: "Sub-Coordinator", parentId:"tech",image:"/team-images/kartik.png", linkedin:"#", x: "#"},
    {id: "dev-aditya", name:"S Aditya ", title: "Sub-Coordinator", parentId:"tech",image:"/team-images/s-aditya.jpg", linkedin:"https://www.linkedin.com/in/aditya-s-one", x: "https://www.instagram.com/adityas.mp4"},
    {id: "dev-priyank", name:"Priyank Kalathiya ", title: "Sub-Coordinator", parentId:"tech",image:"/team-images/priyank.jpeg", linkedin:"https://www.linkedin.com/in/priyank-kalathiya-a039b8369/", x: "https://www.instagram.com/justpriyankk/"},
    {id: "dev-anushka", name:"Anushka Gupta ", title: "Sub-Coordinator", parentId:"tech",image:"x", linkedin:"x", x: "x"},

];