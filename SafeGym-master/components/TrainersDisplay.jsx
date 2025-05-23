import { db } from '@/firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, Text, View } from 'react-native';
export default function TrainersDisplay() {

    const [trainers, setTrainers] = useState([]);

    useEffect(() => {
        const unsubscribeTrainers = onSnapshot(collection(db, 'trainers'), (snapshot) => {
            const trainersData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTrainers(trainersData);
        });
        return () => {
            unsubscribeTrainers();
        };
    });

  return (
    <View>
        <Text className="font-semibold text-xl ml-4  mt-4 mb-8">Meet your trainers</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex flex-row mr-4">
            {trainers.map((trainer) => (
                <TrainersCard key={trainer.id} id={trainer.id} name={trainer.firstName} imageUrl={trainer.profilePhoto} />
            ))}
        </ScrollView>
    </View>
  )
}



function TrainersCard({id, name, imageUrl}) {
    return (
        <View className="flex flex-col gap-1 justify-center items-center ml-8">
            <ImageBackground 
            source={{uri: imageUrl}}
            resizeMode="contain"
            className="h-24 w-24 overflow-hidden rounded-full">

            </ImageBackground>
            <Text className="font-bold">Coach {name}</Text>
            <Text className="text-[#58595B] font-light">ABS</Text>
        </View>
    )
}

