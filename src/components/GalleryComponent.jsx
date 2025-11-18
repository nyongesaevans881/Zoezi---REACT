import { useState } from 'react';
import { GrSearchAdvanced } from 'react-icons/gr';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoChevronBackCircleOutline, IoChevronForwardCircleOutline } from 'react-icons/io5';

export default function GalleryComponent({ images = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openModal = (index) => {
        setCurrentIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'ArrowLeft') goToPrev();
    };

    return (
        <>
            <section className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 max-w-7xl mx-auto">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 h-64 group cursor-pointer"
                            onClick={() => openModal(index)}
                        >
                            <img
                                src={image}
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                <GrSearchAdvanced className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                        aria-label="Close modal"
                    >
                        <IoIosCloseCircleOutline  className="w-8 h-8" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToPrev();
                        }}
                        className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
                        aria-label="Previous image"
                    >
                        <IoChevronBackCircleOutline className="w-10 h-10" />
                    </button>

                    <div
                        className="max-w-5xl max-h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={images[currentIndex]}
                            alt={`Gallery image ${currentIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                        className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
                        aria-label="Next image"
                    >
                        <IoChevronForwardCircleOutline className="w-10 h-10" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    );
}

// Example usage in parent component:
// <SecondaryGallerySection images={[
//     "/gallery/keyworld-school.png",
//     "/gallery/keyworld-students.jpg",
//     "/gallery/students-in-mosque.jpg",
//     "/gallery/graduation.jpg",
//     "/gallery/keyworld-classes.jpg"
// ]} />