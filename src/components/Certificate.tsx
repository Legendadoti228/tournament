
import React, { useRef } from 'react';
import { Team, Tournament } from '@/types/tournament';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

export type CertificateTemplate = 'diploma' | 'gratitude' | 'certificate';

interface CertificateProps {
  tournament: Tournament;
  team: Team;
  place: 1 | 2 | 3;
  template?: CertificateTemplate;
}

const Certificate = ({ tournament, team, place, template = 'diploma' }: CertificateProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const getCertificateTitle = () => {
    switch (template) {
      case 'diploma':
        return place === 1 ? 'Диплом победителя' : `Диплом за ${getPlaceText()}`;
      case 'gratitude':
        return 'Благодарность';
      case 'certificate':
        return 'Сертификат';
      default:
        return 'Диплом участника';
    }
  };

  const getPlaceText = () => {
    switch (place) {
      case 1: return '1 место';
      case 2: return '2 место';
      case 3: return '3 место';
      default: return '';
    }
  };

  const getBorderColor = () => {
    switch (place) {
      case 1: return 'border-[#FFD700]'; // Gold
      case 2: return 'border-[#C0C0C0]'; // Silver
      case 3: return 'border-[#CD7F32]'; // Bronze
      default: return 'border-gray-400';
    }
  };

  const getBackgroundStyle = () => {
    // Try to load background image based on template type
    const backgroundImage = `url(/certificates/${template}-bg.jpg)`;
    
    // Default gradient backgrounds if no custom background is found
    const gradients = {
      diploma: {
        1: 'bg-gradient-to-r from-amber-50 to-yellow-100',
        2: 'bg-gradient-to-r from-gray-50 to-slate-100',
        3: 'bg-gradient-to-r from-orange-50 to-amber-100',
      },
      gratitude: 'bg-gradient-to-r from-blue-50 to-indigo-100',
      certificate: 'bg-gradient-to-r from-green-50 to-emerald-100'
    };

    const bgClass = template === 'diploma' 
      ? gradients.diploma[place as keyof typeof gradients.diploma] 
      : gradients[template as keyof typeof gradients];

    return {
      backgroundImage,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      className: bgClass
    };
  };

  const printCertificate = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = certificateRef.current?.innerHTML || '';
    
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = `
      <style>
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .certificate-print {
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate-print > div {
            width: 90%;
            height: 90%;
            box-shadow: none !important;
          }
        }
      </style>
      <div class="certificate-print">${printContent.innerHTML}</div>
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
  };

  const backgroundStyle = getBackgroundStyle();

  return (
    <div>
      <Button 
        onClick={printCertificate} 
        variant="outline" 
        size="sm"
        className="mb-4"
      >
        <Printer className="mr-2 h-4 w-4" />
        Печать грамоты
      </Button>
      
      <div className="hidden">
        <div ref={certificateRef}>
          <div 
            className={`w-[210mm] h-[297mm] p-8 ${getBorderColor()} m-auto flex flex-col items-center justify-between relative ${backgroundStyle.className}`}
            style={{
              backgroundImage: backgroundStyle.backgroundImage,
              backgroundSize: backgroundStyle.backgroundSize,
              backgroundPosition: backgroundStyle.backgroundPosition
            }}
          >
            <div className="absolute top-0 left-0 right-0 p-4 border-b border-gray-200 text-center">
              <p className="text-sm text-gray-500">{format(new Date(), 'dd.MM.yyyy')}</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full p-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-8">{getCertificateTitle()}</h1>
                <p className="text-xl mb-8">Награждается команда</p>
                <h2 className="text-3xl font-bold mb-4">{team.name}</h2>
                
                {team.members && team.members.length > 0 && (
                  <div className="mb-8">
                    <p className="text-lg mb-2">В составе:</p>
                    <ul className="list-none p-0">
                      {team.members.map((member, index) => (
                        <li key={index} className="text-lg">{member}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {template === 'diploma' && (
                  <>
                    <p className="text-xl mb-4">Занявшая</p>
                    <p className="text-4xl font-bold mb-8">{getPlaceText()}</p>
                  </>
                )}
                
                <p className="text-xl">в турнире</p>
                <h3 className="text-2xl font-bold mb-8">"{tournament.name}"</h3>
              </div>
            </div>
            
            <div className="w-full border-t border-gray-200 pt-8 flex justify-between">
              <div>
                <p className="font-semibold">Организатор</p>
                <p>_________________</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">М.П.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
