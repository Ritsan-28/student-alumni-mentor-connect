import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Briefcase, Link as LinkIcon,
  Link2, Globe, Star, Clock,
  GraduationCap, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { PageLoader } from '../components/common/Loader';
import userService from '../api/userService';
import useAuthStore from '../store/authStore';
import connectionService from '../api/connectionService';
import messageService from '../api/messageService';

const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connStatus, setConnStatus] = useState('none');

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    const load = async () => {
      try {
        const response = await userService.getUserById(id);
        setData(response.data);
      } catch {
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!isOwnProfile && id) {
      connectionService.getConnectionStatus(id)
        .then((res) => setConnStatus(res.data.status))
        .catch(() => {});
    }
  }, [id, isOwnProfile]);

  const handleMessage = async () => {
    try {
      const res = await messageService.getOrCreateConversation(id);
      navigate(`/messages/${res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot message this user');
    }
  };

  if (isLoading) return <PageLoader />;
  if (!data) return (
    <DashboardLayout>
      <div className="text-center py-20">
        <p className="text-gray-500">User not found.</p>
        <Link to="/mentors" className="text-primary-600 mt-2 inline-block">
          Browse Mentors
        </Link>
      </div>
    </DashboardLayout>
  );

  const { user, profile } = data;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Profile Header ── */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar src={user.avatar} name={user.name} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <Badge variant={user.role}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                {user.role === 'mentor' && profile?.availability && (
                  <Badge variant={profile.availability}>
                    {profile.availability === 'available' ? '🟢' :
                     profile.availability === 'busy' ? '🟡' : '🔴'}{' '}
                    {profile.availability.charAt(0).toUpperCase() + profile.availability.slice(1)}
                  </Badge>
                )}
              </div>

              {(profile?.currentPosition || profile?.currentCompany) && (
                <p className="text-gray-600 flex items-center gap-1.5 mb-1">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  {[profile.currentPosition, profile.currentCompany]
                    .filter(Boolean).join(' @ ')}
                </p>
              )}

              {profile?.location && (
                <p className="text-gray-500 flex items-center gap-1.5 mb-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {profile.location}
                </p>
              )}

              {profile?.yearsOfExperience && (
                <p className="text-gray-500 flex items-center gap-1.5 mb-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {profile.yearsOfExperience} years of experience
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-4">
                {isOwnProfile ? (
                  <Link to="/profile" className="btn-secondary text-sm">
                    Edit Profile
                  </Link>
                ) : (
                  <>
                    <button className="btn-primary text-sm">
                      <Users className="h-4 w-4 mr-1.5 inline" />
                      Connect
                    </button>
                    {connStatus === 'accepted' && (
                      <button onClick={handleMessage} className="btn-primary text-sm">
                        💬 Message
                      </button>
                    )}
                  </>
                )}

                {profile?.socialLinks?.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary text-sm flex items-center gap-1.5">
                    <LinkIcon className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {profile?.socialLinks?.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary text-sm flex items-center gap-1.5">
                    <Link2 className="h-4 w-4" /> GitHub
                  </a>
                )}
                {profile?.socialLinks?.website && (
                  <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary text-sm flex items-center gap-1.5">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bio ── */}
        {profile?.bio && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* ── Skills ── */}
        {profile?.skills?.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="primary" size="md">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* ── Expertise (Mentor only) ── */}
        {user.role === 'mentor' && profile?.expertise?.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              <Star className="inline h-5 w-5 mr-2 text-emerald-500" />
              Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((item) => (
                <Badge key={item} variant="success" size="md">{item}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* ── Career Goal (Student only) ── */}
        {user.role === 'student' && profile?.careerGoal && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              <GraduationCap className="inline h-5 w-5 mr-2 text-indigo-500" />
              Career Goal
            </h2>
            <p className="text-gray-600 leading-relaxed">{profile.careerGoal}</p>
          </div>
        )}

        {/* ── Education ── */}
        {profile?.education?.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
            <div className="space-y-4">
              {profile.education.map((edu, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{edu.degree}</p>
                    <p className="text-gray-600">{edu.institution}</p>
                    {edu.fieldOfStudy && (
                      <p className="text-gray-500 text-sm">{edu.fieldOfStudy}</p>
                    )}
                    <p className="text-gray-400 text-sm">
                      {edu.startYear} –{' '}
                      {edu.isCurrentlyStudying ? 'Present' : edu.endYear}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ProfileView;